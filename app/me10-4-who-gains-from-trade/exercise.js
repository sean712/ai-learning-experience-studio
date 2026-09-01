"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// A categorisation drag-and-drop. Students sort four groups into three
// categories (winners, may not be affected, losers). Unlike the fixed-cell
// tables, the order within a category is meaningless, so each category is a
// bucket that can hold any number of tiles. Grading is by category.
//
// On checking, each tile is marked against its expected category and the full
// feedback text is shown.
// ---------------------------------------------------------------------------
const COLUMNS = [
  { key: "winners", name: "Winners from trade" },
  { key: "may-not", name: "May not be affected by trade" },
  { key: "losers", name: "Losers from trade" },
];

const TILES = [
  { id: "consumers", label: "Consumers", correct: "winners" },
  {
    id: "non-traded",
    label: "Workers producing goods and services that are not traded",
    correct: "may-not",
  },
  {
    id: "import-competing",
    label: "Workers in industries competing with imports",
    correct: "losers",
  },
  { id: "exporting", label: "Workers in exporting industries", correct: "winners" },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const COLUMN_NAME = Object.fromEntries(COLUMNS.map((c) => [c.key, c.name]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));
const STORAGE_KEY = "me10-4-who-gains-from-trade:v1";

// Every tile starts in the tray. A tile's location is "tray" or a column key.
function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

const WhoGainsFromTrade = () => {
  const [locations, setLocations] = useState(makeInitialLocations);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [focusTarget, setFocusTarget] = useState(null);

  const columnRefs = useRef({});
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
          if (value === "tray" || COLUMN_KEYS.includes(value)) next[tile.id] = value;
        }
        setLocations(next);
      }
    } catch {
      // localStorage may be unavailable; start from an empty layout.
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
      focusTarget.kind === "column"
        ? columnRefs.current[focusTarget.key]
        : tileRefs.current[focusTarget.key];
    if (element) element.focus();
    setFocusTarget(null);
  }, [focusTarget, locations]);

  // --- Helpers used during render ------------------------------------------

  const tilesIn = (columnKey) => TILES.filter((t) => locations[t.id] === columnKey);
  const trayTiles = TILES.filter((t) => locations[t.id] === "tray");
  const placedCount = TILES.length - trayTiles.length;
  const allPlaced = trayTiles.length === 0;
  const correctCount = TILES.filter(
    (t) => locations[t.id] === t.correct
  ).length;
  const allCorrect = submitted && correctCount === TILES.length;

  const announce = (message) => setAnnouncement(message);

  // Any change to the arrangement clears the "submitted" state.
  const applyLocations = (updater) => {
    setLocations(updater);
    setSubmitted(false);
  };

  // --- Placement logic (shared by click, keyboard and drag) ----------------

  // Move a tile into a category (or the tray). Categories hold any number of
  // tiles, so there is no swapping.
  const moveTile = (tileId, target) => {
    applyLocations((prev) => ({ ...prev, [tileId]: target }));
  };

  const handleTileClick = (tileId) => {
    if (selected === tileId) {
      setSelected(null);
      announce(`Put down ${TILE_BY_ID[tileId].label}.`);
    } else {
      setSelected(tileId);
      announce(
        `Picked up ${TILE_BY_ID[tileId].label}. Move to a category and press Enter or Space to drop it in.`
      );
    }
  };

  // Activate a category by click or keyboard.
  const handleColumnActivate = (columnKey) => {
    if (!selected) {
      announce(`${COLUMN_NAME[columnKey]}. Pick up a tile first.`);
      return;
    }
    const label = TILE_BY_ID[selected].label;
    moveTile(selected, columnKey);
    announce(`Placed ${label} in ${COLUMN_NAME[columnKey]}.`);
    setSelected(null);
    setFocusTarget({ kind: "column", key: columnKey });
  };

  const returnSelectedToTray = () => {
    if (!selected || locations[selected] === "tray") return;
    const tileId = selected;
    moveTile(tileId, "tray");
    announce(`Returned ${TILE_BY_ID[tileId].label} to the list.`);
    setSelected(null);
    setFocusTarget({ kind: "tile", key: tileId });
  };

  // --- Native drag and drop (mouse) ----------------------------------------

  const handleDragStart = (event, tileId) => {
    event.dataTransfer.setData("text/plain", tileId);
    event.dataTransfer.effectAllowed = "move";
    setSelected(null);
  };

  const handleColumnDrop = (event, columnKey) => {
    event.preventDefault();
    setDragOverKey(null);
    const tileId = event.dataTransfer.getData("text/plain");
    if (tileId && TILE_BY_ID[tileId]) {
      moveTile(tileId, columnKey);
      announce(`Placed ${TILE_BY_ID[tileId].label} in ${COLUMN_NAME[columnKey]}.`);
    }
  };

  const handleTrayDrop = (event) => {
    event.preventDefault();
    const tileId = event.dataTransfer.getData("text/plain");
    if (tileId && TILE_BY_ID[tileId] && locations[tileId] !== "tray") {
      moveTile(tileId, "tray");
      announce(`Returned ${TILE_BY_ID[tileId].label} to the list.`);
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
      correctCount === TILES.length
        ? "Well done, every group is in the expected category. Feedback is shown below."
        : `You have ${correctCount} out of ${TILES.length} groups in the expected category. Feedback is shown below.`
    );
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The exercise has been reset. All groups are back in the list.");
  };

  // --- Rendering -----------------------------------------------------------

  // A placed tile, shown inside a category. Draggable and selectable so it can
  // be moved again.
  const renderPlacedTile = (tile, columnKey) => {
    const isSelectedHere = selected === tile.id;
    const isRight = submitted && columnKey === tile.correct;
    const isWrong = submitted && columnKey !== tile.correct;

    let stateClasses;
    if (isRight) {
      stateClasses = "border-emerald-600 bg-emerald-50 text-emerald-900";
    } else if (isWrong) {
      stateClasses = "border-rose-600 bg-rose-50 text-rose-900";
    } else {
      stateClasses = `bg-violet-100 text-violet-900 ${
        isSelectedHere ? "border-violet-600 ring-2 ring-violet-600" : "border-violet-300 hover:bg-violet-200"
      }`;
    }

    let label = `${tile.label}. In ${COLUMN_NAME[columnKey]}.`;
    if (submitted) label += columnKey === tile.correct ? " Expected category." : " Not the expected category.";
    label += " Press Enter to pick it up and move it.";

    return (
      <button
        key={tile.id}
        type="button"
        ref={(element) => {
          tileRefs.current[tile.id] = element;
        }}
        draggable
        onDragStart={(event) => handleDragStart(event, tile.id)}
        onClick={() => handleTileClick(tile.id)}
        aria-label={label}
        className={`flex w-full items-center gap-1.5 rounded-md border-2 p-2 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${stateClasses}`}
      >
        {submitted &&
          (isRight ? (
            <CheckCircle2 className="h-4 w-4 flex-none text-emerald-700" aria-hidden="true" />
          ) : (
            <XCircle className="h-4 w-4 flex-none text-rose-700" aria-hidden="true" />
          ))}
        {tile.label}
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
            Who gains from trade?
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              We know that international trade based on comparative advantage means
              that a country can consume more than if it was self-sufficient, but
              does this mean that every group within the country will gain?
            </p>
            <p>
              When thinking about each group, think about them only in that role,
              so don&apos;t worry about which part of the economy a
              &apos;consumer&apos; might work in.
            </p>
            <p className="font-semibold text-slate-900">
              Do the following groups win or lose from trade, or are they
              unaffected?
            </p>
          </div>
        </header>

        {/* How to interact */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag a tile into a category, or use your keyboard: move to a tile and
          press Enter or Space to pick it up, then move to a category and press
          Enter or Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move a tile that is already in a category: select it to
          pick it up, then select another category. To take a tile out, pick it
          up and use the &apos;Return the selected tile to the list&apos; button.
        </p>

        {/* Tray of tiles still to place. Also a drop target for removing. */}
        <section aria-label="Groups to place" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Groups to place
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">All groups have been placed.</p>
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
                  className={`cursor-grab rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 active:cursor-grabbing ${
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
                className="rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
              >
                Return the selected tile to the list
              </button>
            )}
          </div>
        </section>

        {/* The three category buckets. Three columns on wider screens (one per
            category); they stack on narrow screens. */}
        <section aria-label="Categories" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((column) => {
              const placed = tilesIn(column.key);
              const isDropTarget = dragOverKey === column.key;
              return (
                <div
                  key={column.key}
                  onDragOver={allowDrop}
                  onDragEnter={() => setDragOverKey(column.key)}
                  onDragLeave={() =>
                    setDragOverKey((current) => (current === column.key ? null : current))
                  }
                  onDrop={(event) => handleColumnDrop(event, column.key)}
                  className={`flex flex-col rounded-lg border-2 bg-white ${
                    isDropTarget ? "border-violet-500 ring-2 ring-violet-500" : "border-slate-200"
                  }`}
                >
                  <h3 className="rounded-t-md bg-slate-800 p-3 text-center text-sm font-semibold text-white">
                    {column.name}
                  </h3>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    {placed.map((tile) => renderPlacedTile(tile, column.key))}
                    {/* Keyboard/click drop target for this category. */}
                    <button
                      type="button"
                      ref={(element) => {
                        columnRefs.current[column.key] = element;
                      }}
                      onClick={() => handleColumnActivate(column.key)}
                      aria-label={`${column.name}. ${placed.length} ${
                        placed.length === 1 ? "tile" : "tiles"
                      } placed.${
                        selected
                          ? ` Press Enter to place ${TILE_BY_ID[selected].label} here.`
                          : ""
                      }`}
                      className={`min-h-[52px] rounded-md border-2 border-dashed p-2 text-center text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                        selected
                          ? "border-violet-500 bg-violet-50 text-violet-700 hover:bg-violet-100"
                          : "border-slate-300 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {selected ? "Place here" : "Drop tiles here"}
                    </button>
                  </div>
                </div>
              );
            })}
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
            Submit
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
            {placedCount} of {TILES.length} placed
          </p>
        </div>

        {/* Feedback shown after submitting. The tiles above are marked against
            their expected category; the text explains the reasoning. */}
        {submitted && (
          <div
            role="region"
            aria-label="Feedback"
            className={`mt-6 rounded-xl border-2 p-5 ${
              allCorrect ? "border-emerald-600 bg-emerald-50" : "border-slate-300 bg-slate-100"
            }`}
          >
            <h2 className="text-lg font-bold text-slate-900">Feedback</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
              <p className="font-semibold">Thank you for your answers.</p>
              <p>
                We would expect consumers to gain from trade, with a larger variety
                of products available, which will on average be cheaper (goods that
                are exported might become more expensive, though). Workers in
                exporting industries will also gain: with more demand for their
                skills, their wages should be higher.
              </p>
              <p>
                On the other hand, workers in industries that are competing with
                imports are likely to lose, as there will be less demand for their
                skills.
              </p>
              <p>
                What about workers in other industries? I have set the exercise up
                with &apos;may not be affected by trade&apos; as the correct answer,
                but I chose that wording carefully. Some workers who produce
                services or non-traded goods might have the right skills to work in
                an exporting industry and would gain if the demand for those skills
                was increasing.
              </p>
              <p>
                Other people might work in an industry that uses imported materials
                or components and, if those become cheaper through trade, the
                industry using them can expand, benefiting its workers. Every worker
                is likely to be a consumer, of course, although I asked you to think
                of people only in their capacity as workers or consumers when
                placing the boxes.
              </p>
            </div>
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

export default WhoGainsFromTrade;
