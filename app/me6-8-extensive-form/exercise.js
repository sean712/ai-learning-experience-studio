"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// The game (extensive form).
//
// 'Letters' moves first (A or B), then 'Numbers' moves (1 or 2). The student
// drags ten labels onto a game tree. The right-hand branch (B) is drawn but its
// second moves and payoffs are NOT placed by the student — they would duplicate
// labels — and are revealed in blue in the feedback, matching the original
// activity.
//
// The tree is laid out on a fixed pixel canvas so the connector lines (drawn in
// an SVG) and the drop zones (absolutely positioned buttons) always line up.
// On narrow screens the whole canvas scrolls horizontally.
// ---------------------------------------------------------------------------
const CANVAS = { width: 760, height: 540 };

// Centre points for every position in the tree.
const P = {
  root: { x: 450, y: 45 },
  nodeA: { x: 315, y: 150 },
  nodeB: { x: 585, y: 150 },
  a1: { x: 250, y: 265 },
  a2: { x: 380, y: 265 },
  b1: { x: 520, y: 265 },
  b2: { x: 650, y: 265 },
  lpA1: { x: 250, y: 380 },
  lpA2: { x: 380, y: 380 },
  lpB1: { x: 520, y: 380 },
  lpB2: { x: 650, y: 380 },
  npA1: { x: 250, y: 450 },
  npA2: { x: 380, y: 450 },
  npB1: { x: 520, y: 450 },
  npB2: { x: 650, y: 450 },
  lettersChooses: { x: 100, y: 150 },
  numbersChooses: { x: 100, y: 265 },
  lettersPayoffLabel: { x: 100, y: 380 },
  numbersPayoffLabel: { x: 100, y: 450 },
};

// The connector lines, drawn parent-edge to child-edge for a clean join.
const LINES = [
  { from: { x: 450, y: 52 }, to: { x: 315, y: 130 } },
  { from: { x: 450, y: 52 }, to: { x: 585, y: 130 } },
  { from: { x: 315, y: 170 }, to: { x: 250, y: 245 } },
  { from: { x: 315, y: 170 }, to: { x: 380, y: 245 } },
  { from: { x: 585, y: 170 }, to: { x: 520, y: 245 } },
  { from: { x: 585, y: 170 }, to: { x: 650, y: 245 } },
];

// The ten drop zones, in a logical top-to-bottom reading order so keyboard tab
// order follows the structure of the tree. `position` is the plain-language
// description read out to screen reader users.
const ZONES = [
  { key: "lettersChooses", ...P.lettersChooses, w: 154, h: 44, correct: "letters-chooses", position: "first-move player label, on the left" },
  { key: "nodeA", ...P.nodeA, w: 66, h: 40, correct: "a", position: "first move, left branch" },
  { key: "nodeB", ...P.nodeB, w: 66, h: 40, correct: "b", position: "first move, right branch" },
  { key: "numbersChooses", ...P.numbersChooses, w: 154, h: 44, correct: "numbers-chooses", position: "second-move player label, on the left" },
  { key: "a1", ...P.a1, w: 66, h: 40, correct: "one", position: "second move under the left branch, left option" },
  { key: "a2", ...P.a2, w: 66, h: 40, correct: "two", position: "second move under the left branch, right option" },
  { key: "lpA1", ...P.lpA1, w: 66, h: 40, correct: "three", position: "Letters payoff, left branch then left option" },
  { key: "lpA2", ...P.lpA2, w: 66, h: 40, correct: "six", position: "Letters payoff, left branch then right option" },
  { key: "npA1", ...P.npA1, w: 66, h: 40, correct: "four", position: "Numbers payoff, left branch then left option" },
  { key: "npA2", ...P.npA2, w: 66, h: 40, correct: "five", position: "Numbers payoff, left branch then right option" },
];

// The ten draggable tiles. Order here is the order they first appear in the
// tray, deliberately mixed (matching the original activity's label bank).
const TILES = [
  { id: "three", label: "3" },
  { id: "letters-chooses", label: "'Letters' chooses" },
  { id: "b", label: "B" },
  { id: "six", label: "6" },
  { id: "four", label: "4" },
  { id: "two", label: "2" },
  { id: "five", label: "5" },
  { id: "one", label: "1" },
  { id: "a", label: "A" },
  { id: "numbers-chooses", label: "'Numbers' chooses" },
];

// The right-hand (B) branch values, revealed in blue after the student checks
// their answers. These were never draggable — they simply complete the picture.
const B_REVEAL = [
  { ...P.b1, label: "1" },
  { ...P.b2, label: "2" },
  { ...P.lpB1, label: "5" },
  { ...P.lpB2, label: "4" },
  { ...P.npB1, label: "6" },
  { ...P.npB2, label: "3" },
];

const ZONE_KEYS = ZONES.map((z) => z.key);
const CORRECT_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.correct]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));

const STORAGE_KEY = "me6-8-extensive-form:v1";

// Every tile starts in the tray. A tile's "location" is either "tray" or a zone
// key.
function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

const ExtensiveForm = () => {
  // The single source of truth: where each tile currently is.
  const [locations, setLocations] = useState(makeInitialLocations);
  // The tile the student has "picked up" (for click and keyboard placement).
  const [selected, setSelected] = useState(null);
  // Whether the student has checked their answers (reveals correctness + the B
  // branch).
  const [submitted, setSubmitted] = useState(false);
  // The zone currently being dragged over, used to highlight the drop target.
  const [dragOverKey, setDragOverKey] = useState(null);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");
  // After a keyboard/click action, focus is moved to a sensible element.
  const [focusTarget, setFocusTarget] = useState(null);

  const zoneRefs = useRef({});
  const tileRefs = useRef({});
  const didLoadRef = useRef(false);

  // Load saved progress once, after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = makeInitialLocations();
        for (const tile of TILES) {
          const value = saved[tile.id];
          if (value === "tray" || ZONE_KEYS.includes(value)) next[tile.id] = value;
        }
        setLocations(next);
      }
    } catch {
      // localStorage may be unavailable; just start from an empty tree.
    }
    didLoadRef.current = true;
  }, []);

  // Persist progress whenever the arrangement changes (but not before load).
  useEffect(() => {
    if (!didLoadRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    } catch {
      // Ignore storage failures.
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

  // --- Helpers used during render ------------------------------------------

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

  // Any change to the arrangement clears the "submitted" state.
  const applyLocations = (updater) => {
    setLocations(updater);
    setSubmitted(false);
  };

  // --- Placement logic (shared by click, keyboard and drag) ----------------

  // Move a tile into a zone, swapping with any occupant.
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

  const handleTileClick = (tileId) => {
    if (selected === tileId) {
      setSelected(null);
      announce(`Put down ${TILE_BY_ID[tileId].label}.`);
    } else {
      setSelected(tileId);
      announce(
        `Picked up ${TILE_BY_ID[tileId].label}. Move to a place on the tree and press Enter or Space to drop it.`
      );
    }
  };

  const handleZoneClick = (zone) => {
    const zoneKey = zone.key;
    const occupant = tileAtZone(zoneKey);

    if (selected) {
      const selectedLabel = TILE_BY_ID[selected].label;
      if (locations[selected] === zoneKey) {
        setSelected(null);
        announce(`Kept ${selectedLabel} in the ${zone.position}.`);
        return;
      }
      placeTile(selected, zoneKey);
      announce(
        occupant
          ? `Placed ${selectedLabel} in the ${zone.position}, swapping with ${occupant.label}.`
          : `Placed ${selectedLabel} in the ${zone.position}.`
      );
      setSelected(null);
      setFocusTarget({ kind: "zone", key: zoneKey });
      return;
    }

    if (occupant) {
      setSelected(occupant.id);
      announce(
        `Picked up ${occupant.label} from the ${zone.position}. Move to another place to put it.`
      );
    } else {
      announce(`The ${zone.position} is empty. Pick up a label first.`);
    }
  };

  const returnSelectedToTray = () => {
    if (!selected || locations[selected] === "tray") return;
    const tileId = selected;
    applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
    announce(`Returned ${TILE_BY_ID[tileId].label} to the labels.`);
    setSelected(null);
    setFocusTarget({ kind: "tile", key: tileId });
  };

  // --- Native drag and drop (mouse) ----------------------------------------

  const handleDragStart = (event, tileId) => {
    event.dataTransfer.setData("text/plain", tileId);
    event.dataTransfer.effectAllowed = "move";
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
      announce(`Returned ${TILE_BY_ID[tileId].label} to the labels.`);
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
        ? "Well done, every label is in the right place. The right-hand branch of the tree is now shown in blue."
        : `You have ${correctCount} out of ${ZONES.length} labels in the right place. Adjust the ones outlined in red and check again.`
    );
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The tree has been reset. All labels are back in the list.");
  };

  // --- Rendering -----------------------------------------------------------

  // Common absolute-position style for anything placed on the canvas.
  const atPoint = (point, w, h) => ({
    position: "absolute",
    left: point.x - w / 2,
    top: point.y - h / 2,
    width: w,
    height: h,
  });

  const renderZone = (zone) => {
    const tile = tileAtZone(zone.key);
    const isRight = submitted && tile && tile.id === zone.correct;
    const isWrong = submitted && tile && tile.id !== zone.correct;
    const isSelectedHere = tile && selected === tile.id;
    const isDropTarget = dragOverKey === zone.key;

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
          ? "border-violet-500 bg-violet-50"
          : "border-slate-300 bg-white"
      }`;
    }
    if (isDropTarget) stateClasses += " ring-2 ring-violet-500 border-violet-500";

    // Accessible name describing the position and current contents.
    let label = `Drop zone: ${zone.position}.`;
    label += tile ? ` Contains ${tile.label}.` : " Empty.";
    if (submitted && tile) label += tile.id === zone.correct ? " Correct." : " Incorrect.";
    if (selected && (!tile || selected !== tile.id)) {
      label += ` Press Enter to place ${TILE_BY_ID[selected].label} here.`;
    } else if (!selected && tile) {
      label += " Press Enter to pick it up.";
    }

    return (
      <button
        key={zone.key}
        type="button"
        ref={(element) => {
          zoneRefs.current[zone.key] = element;
        }}
        draggable={!!tile}
        onDragStart={tile ? (event) => handleDragStart(event, tile.id) : undefined}
        onDragOver={allowDrop}
        onDragEnter={() => setDragOverKey(zone.key)}
        onDragLeave={() =>
          setDragOverKey((current) => (current === zone.key ? null : current))
        }
        onDrop={(event) => handleZoneDrop(event, zone.key)}
        onClick={() => handleZoneClick(zone)}
        aria-label={label}
        style={atPoint(zone, zone.w, zone.h)}
        className={`z-10 flex items-center justify-center rounded-md px-1 text-center text-sm font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 ${stateClasses}`}
      >
        {tile ? (
          <span className="flex items-center gap-1">
            {/* Tick/cross reinforces the colour so correctness is not shown by
                colour alone. */}
            {submitted &&
              (isRight ? (
                <CheckCircle2 className="h-4 w-4 flex-none text-emerald-700" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 flex-none text-rose-700" aria-hidden="true" />
              ))}
            {tile.label}
          </span>
        ) : (
          ""
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
            Games in extensive form
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              This is a game between &apos;Letters&apos; and &apos;Numbers&apos;.
              Letters moves first and chooses between two strategies, A and B.
              Numbers then chooses between strategies 1 and 2.
            </p>
            <p>
              If Letters chooses A and Numbers chooses 1, Letters gets a payoff of
              3 and Numbers a payoff of 4. If Letters chooses B and Numbers chooses
              1, Letters gets a payoff of 5 and Numbers a payoff of 6.
            </p>
            <p>
              If Letters chooses A and Numbers chooses 2, Letters gets a payoff of
              6 and Numbers a payoff of 5. If Letters chooses B and Numbers chooses
              2, Letters gets a payoff of 4 and Numbers a payoff of 3.
            </p>
            <p className="text-slate-600">
              Note: some labels have been left out because they would have been
              identical to others, and each label needs a unique place on the
              diagram. The right-hand branch is completed for you in blue once you
              check your answers.
            </p>
            <p className="font-semibold text-slate-900">
              Drag and drop the labels below to the correct place on the game tree.
            </p>
          </div>
        </header>

        {/* How to interact */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag a label onto the tree, or use your keyboard: move to a label and
          press Enter or Space to pick it up, then move to a place on the tree and
          press Enter or Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move a label that is already on the tree: select its place
          to pick the label up, then select another place to move it. To take a
          label off the tree, pick it up and use the &apos;Return the selected
          label to the list&apos; button.
        </p>

        {/* Tray of labels still to place. Also a drop target for removing. */}
        <section aria-label="Labels to place" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Labels to place
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">All labels are on the tree.</p>
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

            {selected && locations[selected] !== "tray" && (
              <button
                type="button"
                onClick={returnSelectedToTray}
                className="rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
              >
                Return the selected label to the list
              </button>
            )}
          </div>
        </section>

        {/* The game tree. Fixed-size canvas so lines and boxes stay aligned;
            scrolls horizontally on narrow screens. */}
        <section aria-label="Game tree" className="mt-6">
          <div className="overflow-x-auto">
            <div
              role="group"
              aria-label="Game tree. Letters moves first, then Numbers moves."
              className="relative mx-auto"
              style={{ width: CANVAS.width, height: CANVAS.height }}
            >
              {/* Connector lines and fixed nodes, purely decorative. */}
              <svg
                width={CANVAS.width}
                height={CANVAS.height}
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                {LINES.map((line, index) => (
                  <line
                    key={index}
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                ))}
                {/* Root node dot */}
                <circle cx={P.root.x} cy={P.root.y} r="5" fill="#475569" />
                {/* Terminal dots at the ends of the B branch */}
                <circle cx={P.b1.x} cy={P.b1.y - 20} r="3" fill="#94a3b8" />
                <circle cx={P.b2.x} cy={P.b2.y - 20} r="3" fill="#94a3b8" />
              </svg>

              {/* Static row labels on the left for the payoff rows. */}
              <div
                style={atPoint(P.lettersPayoffLabel, 150, 40)}
                className="pointer-events-none flex items-center justify-end pr-2 text-right text-sm font-medium text-slate-600"
              >
                &apos;Letters&apos; payoff
              </div>
              <div
                style={atPoint(P.numbersPayoffLabel, 150, 40)}
                className="pointer-events-none flex items-center justify-end pr-2 text-right text-sm font-medium text-slate-600"
              >
                &apos;Numbers&apos; payoff
              </div>

              {/* The interactive drop zones. */}
              {ZONES.map((zone) => renderZone(zone))}

              {/* The right-hand branch, revealed in blue after checking. */}
              {submitted &&
                B_REVEAL.map((item, index) => (
                  <div
                    key={index}
                    style={atPoint(item, 66, 40)}
                    className="pointer-events-none z-10 flex items-center justify-center text-base font-semibold text-blue-600"
                  >
                    {item.label}
                  </div>
                ))}
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
            {placedCount} of {ZONES.length} labels placed
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
                  Perfect – every label is in the right place.
                </p>
                <p>
                  The right-hand branch of the tree is now shown in blue: these are
                  the payoffs you were not asked to place. Note that the payoffs in
                  the left-hand part of the tree come from the first and third
                  sentences of the game description, not the first and second.
                </p>
                <p>
                  This is actually a coordination game: if we wrote it in normal
                  form we would find two Nash equilibria. If we changed the order of
                  the players so that &apos;Numbers&apos; chooses first, we would
                  find ourselves at the second equilibrium. Why not have a go at
                  writing the game that way round, and in normal form, and see for
                  yourself.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
                <p>
                  You have {correctCount} out of {ZONES.length} labels in the right
                  place. The places outlined in red are not right yet – adjust them
                  and check again.
                </p>
                <p>
                  Tip: work down the tree. Letters moves first (A then B), then
                  Numbers moves (1 then 2). The payoffs in the left-hand branch come
                  from the first and third sentences of the description; the
                  right-hand branch is shown in blue for reference.
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

export default ExtensiveForm;
