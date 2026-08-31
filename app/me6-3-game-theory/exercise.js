"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// Static description of the puzzle.
//
// The matrix is a 3 x 3 grid, stored here in row-major order (nine cells). Two
// cells are fixed: the corner label and the pre-placed '4, 3' payoff, which
// anchors the student in the same way the original activity did. The other
// seven cells are drop zones, each with the id of the tile that belongs there
// and a plain-language position name used for screen reader announcements.
// ---------------------------------------------------------------------------
const GRID = [
  {
    kind: "label",
    key: "corner",
    content: "GM choice in row / Ford choice in column",
  },
  { kind: "zone", key: "r0c1", correct: "sports-car", position: "top row, middle column" },
  { kind: "zone", key: "r0c2", correct: "family-car", position: "top row, right column" },
  { kind: "zone", key: "r1c0", correct: "fully-electric", position: "middle row, left column" },
  { kind: "given", key: "given", content: "4, 3", position: "middle row, middle column" },
  { kind: "zone", key: "r1c2", correct: "gm2-ford5", position: "middle row, right column" },
  { kind: "zone", key: "r2c0", correct: "hybrid", position: "bottom row, left column" },
  { kind: "zone", key: "r2c1", correct: "gm5-ford2", position: "bottom row, middle column" },
  { kind: "zone", key: "r2c2", correct: "gm1-ford1", position: "bottom row, right column" },
];

// The seven draggable tiles. Order here is the order they first appear in the
// tray; it is deliberately mixed so the answer is not laid out in advance.
const TILES = [
  { id: "sports-car", label: "Sports car" },
  { id: "family-car", label: "Family car" },
  { id: "fully-electric", label: "Fully electric" },
  { id: "gm2-ford5", label: "2, 5" },
  { id: "hybrid", label: "Hybrid" },
  { id: "gm5-ford2", label: "5, 2" },
  { id: "gm1-ford1", label: "1, 1" },
];

// Derived lookups, computed once at module load.
const ZONES = GRID.filter((cell) => cell.kind === "zone");
const ZONE_KEYS = ZONES.map((zone) => zone.key);
const CORRECT_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.correct]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));

// Key used to persist progress in the browser. localStorage is per-exercise,
// so refreshing the Canvas iframe keeps the student's arrangement.
const STORAGE_KEY = "me6-3-game-theory:v1";

// Every tile starts in the tray. A tile's "location" is either the string
// "tray" or the key of the zone it currently sits in.
function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

// Capitalise the first letter of a position name for announcements.
function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const PayoffMatrix = () => {
  // The single source of truth: where each tile currently is.
  const [locations, setLocations] = useState(makeInitialLocations);
  // The tile the student has "picked up" (for click and keyboard placement).
  const [selected, setSelected] = useState(null);
  // Whether the student has checked their answers (reveals correctness).
  const [submitted, setSubmitted] = useState(false);
  // The zone currently being dragged over, used to highlight the drop target.
  const [dragOverKey, setDragOverKey] = useState(null);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");

  // After a keyboard or click action we move focus to a sensible element so
  // keyboard users keep their place. { kind: 'zone' | 'tile', key }.
  const [focusTarget, setFocusTarget] = useState(null);

  // Refs to the interactive elements so we can move focus programmatically.
  const zoneRefs = useRef({});
  const tileRefs = useRef({});
  // Guards the save effect so we do not overwrite saved progress with the
  // initial (empty) state before we have loaded from localStorage.
  const didLoadRef = useRef(false);

  // Load any saved progress once, after mount. Doing this in an effect (rather
  // than in the initial state) avoids a server/client hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = makeInitialLocations();
        // Only trust known tile ids and valid locations.
        for (const tile of TILES) {
          const value = saved[tile.id];
          if (value === "tray" || ZONE_KEYS.includes(value)) {
            next[tile.id] = value;
          }
        }
        setLocations(next);
      }
    } catch {
      // localStorage may be unavailable (private mode, blocked storage). That
      // is fine: the student just starts from an empty matrix.
    }
    didLoadRef.current = true;
  }, []);

  // Persist progress whenever the arrangement changes (but not before load).
  useEffect(() => {
    if (!didLoadRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    } catch {
      // Ignore storage failures; they do not affect the exercise itself.
    }
  }, [locations]);

  // Move focus to the requested element after the relevant re-render.
  useEffect(() => {
    if (!focusTarget) return;
    const element =
      focusTarget.kind === "zone"
        ? zoneRefs.current[focusTarget.key]
        : tileRefs.current[focusTarget.key];
    if (element) element.focus();
    setFocusTarget(null);
  }, [focusTarget, locations]);

  // --- Small helpers used during render ------------------------------------

  const tileAtZone = (zoneKey) =>
    TILES.find((t) => locations[t.id] === zoneKey) || null;
  const trayTiles = TILES.filter((t) => locations[t.id] === "tray");
  const placedCount = TILES.length - trayTiles.length;
  const allPlaced = trayTiles.length === 0;
  const correctCount = ZONES.filter((z) => {
    const tile = tileAtZone(z.key);
    return tile && tile.id === CORRECT_BY_KEY[z.key];
  }).length;
  const isSolved = submitted && correctCount === ZONES.length;

  const announce = (message) => setAnnouncement(message);

  // Change the arrangement. Any change clears the "submitted" state so the
  // student is back in editing mode and the feedback matches the board.
  const applyLocations = (updater) => {
    setLocations(updater);
    setSubmitted(false);
  };

  // --- Placement logic (shared by click, keyboard and drag) ----------------

  // Move a tile into a zone. If the zone is occupied, the two tiles swap: the
  // occupant takes the moving tile's previous location (a zone or the tray).
  const placeTile = (tileId, zoneKey) => {
    applyLocations((prev) => {
      if (prev[tileId] === zoneKey) return prev;
      const next = { ...prev };
      const occupantId = TILES.find(
        (t) => prev[t.id] === zoneKey && t.id !== tileId
      )?.id;
      if (occupantId) next[occupantId] = prev[tileId];
      next[tileId] = zoneKey;
      return next;
    });
  };

  // Toggle a tile as picked up / put down (used for tray tiles).
  const handleTileClick = (tileId) => {
    if (selected === tileId) {
      setSelected(null);
      announce(`Put down ${TILE_BY_ID[tileId].label}.`);
    } else {
      setSelected(tileId);
      announce(
        `Picked up ${TILE_BY_ID[tileId].label}. Move to a cell and press Enter or Space to place it.`
      );
    }
  };

  // Activate a drop zone by click or keyboard.
  const handleZoneClick = (cell) => {
    const zoneKey = cell.key;
    const occupant = tileAtZone(zoneKey);

    if (selected) {
      const selectedLabel = TILE_BY_ID[selected].label;
      if (locations[selected] === zoneKey) {
        // Activating the cell the picked-up tile already sits in cancels the
        // move and leaves it where it is.
        setSelected(null);
        announce(`Kept ${selectedLabel} in the ${cell.position}.`);
        return;
      }
      placeTile(selected, zoneKey);
      announce(
        occupant
          ? `Placed ${selectedLabel} in the ${cell.position}, swapping with ${occupant.label}.`
          : `Placed ${selectedLabel} in the ${cell.position}.`
      );
      setSelected(null);
      setFocusTarget({ kind: "zone", key: zoneKey });
      return;
    }

    // Nothing picked up yet: an occupied cell hands its tile to the student.
    if (occupant) {
      setSelected(occupant.id);
      announce(
        `Picked up ${occupant.label} from the ${cell.position}. Move to another cell to place it.`
      );
    } else {
      announce(`The ${cell.position} is empty. Pick up a tile first.`);
    }
  };

  // Return the currently picked-up tile to the tray (keyboard-friendly).
  const returnSelectedToTray = () => {
    if (!selected || locations[selected] === "tray") return;
    const tileId = selected;
    applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
    announce(`Returned ${TILE_BY_ID[tileId].label} to the tiles.`);
    setSelected(null);
    setFocusTarget({ kind: "tile", key: tileId });
  };

  // --- Native drag and drop (mouse) ----------------------------------------

  const handleDragStart = (event, tileId) => {
    event.dataTransfer.setData("text/plain", tileId);
    event.dataTransfer.effectAllowed = "move";
    // Clear any keyboard selection so the two mechanisms do not fight.
    setSelected(null);
  };

  const handleZoneDrop = (event, zoneKey) => {
    event.preventDefault();
    setDragOverKey(null);
    const tileId = event.dataTransfer.getData("text/plain");
    if (tileId && TILE_BY_ID[tileId]) {
      placeTile(tileId, zoneKey);
      announce(`Placed ${TILE_BY_ID[tileId].label}.`);
    }
  };

  const handleTrayDrop = (event) => {
    event.preventDefault();
    const tileId = event.dataTransfer.getData("text/plain");
    if (tileId && TILE_BY_ID[tileId] && locations[tileId] !== "tray") {
      applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
      announce(`Returned ${TILE_BY_ID[tileId].label} to the tiles.`);
    }
  };

  const allowDrop = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // --- Submit and reset ----------------------------------------------------

  const handleSubmit = () => {
    setSubmitted(true);
    setSelected(null);
    announce(
      correctCount === ZONES.length
        ? "Well done, every tile is in the right place."
        : `You have ${correctCount} out of ${ZONES.length} tiles in the right place. Adjust the cells outlined in red and check again.`
    );
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The matrix has been reset. All tiles are back in the tray.");
  };

  // --- Rendering -----------------------------------------------------------

  // Render one of the nine matrix cells.
  const renderCell = (cell) => {
    // Fixed corner label.
    if (cell.kind === "label") {
      return (
        <div
          key={cell.key}
          className="flex min-h-[76px] items-center rounded-lg bg-slate-100 p-3 text-xs font-medium text-slate-700 sm:text-sm"
        >
          {cell.content}
        </div>
      );
    }

    // Fixed, pre-placed '4, 3' payoff.
    if (cell.kind === "given") {
      return (
        <div
          key={cell.key}
          className="flex min-h-[76px] flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-100 p-3 text-slate-800"
        >
          <span className="text-sm font-semibold sm:text-base">
            {cell.content}
          </span>
          <span className="mt-1 text-xs text-slate-500">(given)</span>
        </div>
      );
    }

    // A drop zone.
    const tile = tileAtZone(cell.key);
    const isRight = submitted && tile && tile.id === cell.correct;
    const isWrong = submitted && tile && tile.id !== cell.correct;
    const isSelectedHere = tile && selected === tile.id;
    const isDropTarget = dragOverKey === cell.key;

    // Work out the styling for the cell's current state.
    let stateClasses;
    if (isRight) {
      stateClasses = "border-2 border-emerald-600 bg-emerald-50 text-emerald-900";
    } else if (isWrong) {
      stateClasses = "border-2 border-rose-600 bg-rose-50 text-rose-900";
    } else if (tile) {
      stateClasses = `border-2 bg-violet-100 text-violet-900 ${
        isSelectedHere
          ? "border-violet-600 ring-2 ring-violet-600"
          : "border-violet-300 hover:bg-violet-200"
      }`;
    } else {
      stateClasses = `border-2 border-dashed ${
        selected
          ? "border-violet-500 bg-violet-50 text-violet-700"
          : "border-slate-300 bg-white text-slate-600"
      }`;
    }
    if (isDropTarget) {
      stateClasses += " ring-2 ring-violet-500 border-violet-500";
    }

    // Build a descriptive label for assistive technology.
    let label = `${capitalise(cell.position)}.`;
    label += tile ? ` Contains ${tile.label}.` : " Empty.";
    if (submitted && tile) {
      label += tile.id === cell.correct ? " Correct." : " Incorrect.";
    }
    if (selected && (!tile || selected !== tile.id)) {
      label += ` Press Enter to place ${TILE_BY_ID[selected].label} here.`;
    } else if (!selected && tile) {
      label += " Press Enter to pick it up.";
    }

    return (
      <button
        key={cell.key}
        type="button"
        ref={(element) => {
          zoneRefs.current[cell.key] = element;
        }}
        draggable={!!tile}
        onDragStart={tile ? (event) => handleDragStart(event, tile.id) : undefined}
        onDragOver={allowDrop}
        onDragEnter={() => setDragOverKey(cell.key)}
        onDragLeave={() =>
          setDragOverKey((current) => (current === cell.key ? null : current))
        }
        onDrop={(event) => handleZoneDrop(event, cell.key)}
        onClick={() => handleZoneClick(cell)}
        aria-label={label}
        className={`flex min-h-[76px] w-full items-center justify-center rounded-lg p-2 text-center text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 sm:p-3 sm:text-sm ${stateClasses}`}
      >
        {tile ? (
          <span className="flex items-center gap-1.5">
            {submitted &&
              (isRight ? (
                <CheckCircle2
                  className="h-4 w-4 flex-none text-emerald-700"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="h-4 w-4 flex-none text-rose-700"
                  aria-hidden="true"
                />
              ))}
            {tile.label}
          </span>
        ) : (
          <span aria-hidden="true">{selected ? "Place here" : "Drop tile here"}</span>
        )}
      </button>
    );
  };

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Scenario and instructions */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Setting up a payoff matrix
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              Ford and GM have to decide on features for their next model of car.
              Ford is choosing between a sports car and a family car, while GM is
              choosing between fully electric and hybrid. We set up the game with
              GM as the row player, so GM&apos;s strategies go in the left-hand
              column and its payoff is written first in each pair.
            </p>
            <p>
              If GM chooses fully electric and Ford chooses a sports car, GM gets
              a payoff of 4 and Ford gets 3. If GM chooses fully electric and Ford
              chooses a family car, GM gets 2 and Ford gets 5. If GM chooses
              hybrid and Ford chooses a sports car, GM gets 5 and Ford gets 2. If
              GM chooses hybrid and Ford chooses a family car, GM gets 1 and Ford
              gets 1.
            </p>
            <p className="font-semibold text-slate-900">
              Move each tile into the right place in the matrix, remembering that
              GM is the row player. The &apos;4, 3&apos; payoff is already in
              place to get you started.
            </p>
          </div>
        </header>

        {/* How to interact. Shown visibly, with a fuller version for screen
            reader users only. */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag a tile into a cell, or use your keyboard: move to a tile and press
          Enter or Space to pick it up, then move to a cell and press Enter or
          Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move a tile that is already in the matrix: select its cell
          to pick the tile up, then select another cell to move it. To take a
          tile out of the matrix, pick it up and use the &apos;Return the
          selected tile to the tiles&apos; button.
        </p>

        {/* Tray of tiles still to place. It is also a drop target so tiles can
            be dragged back out of the matrix. */}
        <section aria-label="Tiles to place" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Tiles to place
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">
                All tiles are in the matrix.
              </p>
            ) : (
              trayTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  ref={(element) => {
                    tileRefs.current[tile.id] = element;
                  }}
                  draggable
                  onDragStart={(event) => handleDragStart(event, tile.id)}
                  onClick={() => handleTileClick(tile.id)}
                  aria-pressed={selected === tile.id}
                  aria-label={`${tile.label}. ${
                    selected === tile.id
                      ? "Selected. Press Enter to cancel."
                      : "Press Enter to pick up."
                  }`}
                  className={`cursor-grab rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 active:cursor-grabbing sm:text-base ${
                    selected === tile.id
                      ? "border-violet-600 bg-violet-200 text-violet-900 ring-2 ring-violet-600"
                      : "border-violet-300 bg-violet-100 text-violet-900 hover:bg-violet-200"
                  }`}
                >
                  {tile.label}
                </button>
              ))
            )}

            {/* Keyboard-friendly way to remove a picked-up tile from the matrix. */}
            {selected && locations[selected] !== "tray" && (
              <button
                type="button"
                onClick={returnSelectedToTray}
                className="rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
              >
                Return the selected tile to the tiles
              </button>
            )}
          </div>
        </section>

        {/* The matrix. Wrapped so it can scroll horizontally on very narrow
            screens rather than forcing the whole page to scroll sideways. */}
        <section aria-label="Payoff matrix" className="mt-6">
          <div className="overflow-x-auto">
            <div
              role="group"
              aria-label="Payoff matrix, a 3 by 3 grid"
              className="grid min-w-[520px] grid-cols-3 gap-2"
            >
              {GRID.map((cell) => renderCell(cell))}
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allPlaced}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Check answers
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Reset
          </button>
          <p className="text-sm text-slate-600" aria-live="polite">
            {placedCount} of {ZONES.length} tiles placed
          </p>
        </div>

        {/* Feedback shown after checking. */}
        {submitted && (
          <div
            role="region"
            aria-label="Feedback"
            className={`mt-6 rounded-xl border-2 p-5 ${
              isSolved
                ? "border-emerald-600 bg-emerald-50"
                : "border-amber-500 bg-amber-50"
            }`}
          >
            <h2 className="text-lg font-bold text-slate-900">Feedback</h2>
            {isSolved ? (
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
                <p className="font-semibold text-emerald-800">
                  Perfect – every tile is in the right place.
                </p>
                <p>
                  The first set of payoffs shows you where the strategies go, then
                  you need to make sure the &apos;2, 5&apos; and &apos;5, 2&apos;
                  are in the right places.
                </p>
                <p>
                  Writing the row player&apos;s payoff first is just a convention,
                  like driving on the left or the right side of the road – it might
                  have been the other way round. But it is very useful to know
                  automatically which payoff belongs to which player, so
                  economists stick with the convention we have.
                </p>
                <p>
                  If you are familiar with games, you should be able to find two
                  Nash equilibria for this game. If not, you&apos;ll learn how to
                  do so in the next activity.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
                <p>
                  You have {correctCount} out of {ZONES.length} tiles in the right
                  place. The cells outlined in red are not right yet – adjust them
                  and check again.
                </p>
                <p>
                  Tip: the &apos;4, 3&apos; is already placed for fully electric
                  against a sports car. Use it to work out where each strategy
                  label goes, then position the remaining payoffs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Visually hidden live region announcing each action. */}
        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>
      </div>
    </div>
  );
};

export default PayoffMatrix;
