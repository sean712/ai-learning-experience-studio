"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// The table (three ways of measuring GDP).
//
// The grid is ten rows by three columns. Each cell is one of:
//   - "fixed": a pre-filled label the student cannot move (e.g. Consumption)
//   - "empty": a cell that stays blank on purpose (some boxes are left empty)
//   - "zone":  a drop zone the student must fill with a specific tile
//
// Grading is exact-cell: each drop zone has one correct tile, matching the
// original answer key.
// ---------------------------------------------------------------------------
const COLUMNS = [
  { key: "exp", header: "Expenditure basis (at market prices), sum of:", name: "Expenditure" },
  { key: "inc", header: "Income basis (at market prices), sum of:", name: "Income" },
  { key: "out", header: "Output basis (at basic prices), sum of:", name: "Output" },
];

// Rows in reading order. `correct` is the id of the tile that belongs in a zone.
const TABLE = [
  [
    { type: "fixed", text: "Consumption" },
    { type: "zone", key: "inc-1", correct: "taxes-goods-services", col: "Income" },
    { type: "fixed", text: "Transport, Retail, Hotels, Leisure Services" },
  ],
  [
    { type: "zone", key: "exp-1", correct: "investment", col: "Expenditure" },
    { type: "fixed", text: "Taxes on production" },
    { type: "zone", key: "out-1", correct: "gov-services", col: "Output" },
  ],
  [
    { type: "zone", key: "exp-2", correct: "gov-spending", col: "Expenditure" },
    { type: "zone", key: "inc-2", correct: "other-income", col: "Income" },
    { type: "zone", key: "out-2", correct: "professional-services", col: "Output" },
  ],
  [
    { type: "zone", key: "exp-3", correct: "exports", col: "Expenditure" },
    { type: "fixed", text: "Wages and salaries" },
    { type: "zone", key: "out-3", correct: "real-estate", col: "Output" },
  ],
  [
    { type: "empty" },
    { type: "zone", key: "inc-3", correct: "profits", col: "Income" },
    { type: "zone", key: "out-4", correct: "financial-services", col: "Output" },
  ],
  [
    { type: "empty" },
    { type: "empty" },
    { type: "zone", key: "out-5", correct: "tv-telecoms", col: "Output" },
  ],
  [
    { type: "empty" },
    { type: "empty" },
    { type: "zone", key: "out-6", correct: "construction", col: "Output" },
  ],
  [
    { type: "fixed", text: "Minus:" },
    { type: "empty" },
    { type: "zone", key: "out-7", correct: "gas-electricity-water", col: "Output" },
  ],
  [
    { type: "zone", key: "exp-4", correct: "imports", col: "Expenditure" },
    { type: "empty" },
    { type: "zone", key: "out-8", correct: "manufacturing", col: "Output" },
  ],
  [
    { type: "empty" },
    { type: "empty" },
    { type: "zone", key: "out-9", correct: "agriculture-mining", col: "Output" },
  ],
];

// The sixteen draggable tiles, in the order they first appear in the tray
// (matching the original activity's answer-tile list).
const TILES = [
  { id: "taxes-goods-services", label: "Taxes on goods and services" },
  { id: "investment", label: "Investment" },
  { id: "gov-services", label: "Government Services, Health and Education" },
  { id: "gov-spending", label: "Government spending" },
  { id: "other-income", label: "Other income" },
  { id: "professional-services", label: "Professional Services" },
  { id: "exports", label: "Exports" },
  { id: "real-estate", label: "Real Estate" },
  { id: "profits", label: "Profits" },
  { id: "financial-services", label: "Financial Services" },
  { id: "tv-telecoms", label: "TV Telecoms, Computing" },
  { id: "construction", label: "Construction" },
  { id: "gas-electricity-water", label: "Gas, Electricity, Water" },
  { id: "imports", label: "Imports" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "agriculture-mining", label: "Agriculture, Mining, Oil and Gas" },
];

// Flatten the table into a list of zones, remembering each zone's row so we can
// describe its position to screen reader users.
const ZONES = [];
TABLE.forEach((row, rowIndex) => {
  row.forEach((cell) => {
    if (cell.type === "zone") {
      ZONES.push({ ...cell, position: `${cell.col} column, row ${rowIndex + 1}` });
    }
  });
});

const ZONE_KEYS = ZONES.map((z) => z.key);
const CORRECT_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.correct]));
const POSITION_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.position]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));

const STORAGE_KEY = "me7-3-components-of-gdp:v1";

function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

const ComponentsOfGdp = () => {
  const [locations, setLocations] = useState(makeInitialLocations);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [announcement, setAnnouncement] = useState("");
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
      // localStorage may be unavailable; start from an empty table.
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
        `Picked up ${TILE_BY_ID[tileId].label}. Move to a cell and press Enter or Space to place it.`
      );
    }
  };

  const handleZoneClick = (zoneKey) => {
    const occupant = tileAtZone(zoneKey);
    const position = POSITION_BY_KEY[zoneKey];

    if (selected) {
      const selectedLabel = TILE_BY_ID[selected].label;
      if (locations[selected] === zoneKey) {
        setSelected(null);
        announce(`Kept ${selectedLabel} in the ${position}.`);
        return;
      }
      placeTile(selected, zoneKey);
      announce(
        occupant
          ? `Placed ${selectedLabel} in the ${position}, swapping with ${occupant.label}.`
          : `Placed ${selectedLabel} in the ${position}.`
      );
      setSelected(null);
      setFocusTarget({ kind: "zone", key: zoneKey });
      return;
    }

    if (occupant) {
      setSelected(occupant.id);
      announce(
        `Picked up ${occupant.label} from the ${position}. Move to another cell to place it.`
      );
    } else {
      announce(`The ${position} is empty. Pick up a category first.`);
    }
  };

  const returnSelectedToTray = () => {
    if (!selected || locations[selected] === "tray") return;
    const tileId = selected;
    applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
    announce(`Returned ${TILE_BY_ID[tileId].label} to the categories.`);
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
      announce(`Returned ${TILE_BY_ID[tileId].label} to the categories.`);
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
        ? "Well done, every category is in the right place."
        : `You have ${correctCount} out of ${ZONES.length} categories in the right place. Adjust the cells outlined in red and check again.`
    );
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The table has been reset. All categories are back in the list.");
  };

  // --- Rendering -----------------------------------------------------------

  // Render the button that sits inside a drop-zone cell.
  const renderZoneButton = (cell) => {
    const zoneKey = cell.key;
    const tile = tileAtZone(zoneKey);
    const isRight = submitted && tile && tile.id === cell.correct;
    const isWrong = submitted && tile && tile.id !== cell.correct;
    const isSelectedHere = tile && selected === tile.id;
    const isDropTarget = dragOverKey === zoneKey;

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
          : "border-slate-300 bg-white text-slate-500"
      }`;
    }
    if (isDropTarget) stateClasses += " ring-2 ring-violet-500 border-violet-500";

    // Accessible name describing the position and contents.
    const position = POSITION_BY_KEY[zoneKey];
    let label = `Drop zone: ${position}.`;
    label += tile ? ` Contains ${tile.label}.` : " Empty.";
    if (submitted && tile) label += tile.id === cell.correct ? " Correct." : " Incorrect.";
    if (selected && (!tile || selected !== tile.id)) {
      label += ` Press Enter to place ${TILE_BY_ID[selected].label} here.`;
    } else if (!selected && tile) {
      label += " Press Enter to pick it up.";
    }

    return (
      <button
        type="button"
        ref={(element) => {
          zoneRefs.current[zoneKey] = element;
        }}
        draggable={!!tile}
        onDragStart={tile ? (event) => handleDragStart(event, tile.id) : undefined}
        onDragOver={allowDrop}
        onDragEnter={() => setDragOverKey(zoneKey)}
        onDragLeave={() =>
          setDragOverKey((current) => (current === zoneKey ? null : current))
        }
        onDrop={(event) => handleZoneDrop(event, zoneKey)}
        onClick={() => handleZoneClick(zoneKey)}
        aria-label={label}
        className={`flex min-h-[56px] w-full items-center justify-center gap-1.5 rounded-md p-2 text-center text-sm font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 ${stateClasses}`}
      >
        {tile && submitted && (isRight ? (
          <CheckCircle2 className="h-4 w-4 flex-none text-emerald-700" aria-hidden="true" />
        ) : (
          <XCircle className="h-4 w-4 flex-none text-rose-700" aria-hidden="true" />
        ))}
        {tile ? tile.label : ""}
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
            Components of GDP
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              The table below shows the three different ways of measuring GDP,
              comparing two measures that include taxes on goods and services like
              VAT (&apos;at market prices&apos;) and one that excludes them
              (&apos;at basic prices&apos;). The boxes show the components of GDP
              according to each measure, so that Consumption is a component of the
              expenditure measure of GDP.
            </p>
            <p className="font-semibold text-slate-900">
              Choose which categories belong to each way of calculating GDP and
              drop them in the appropriate place. Some boxes are left empty on
              purpose.
            </p>
          </div>
        </header>

        {/* How to interact */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag a category into a cell, or use your keyboard: move to a category and
          press Enter or Space to pick it up, then move to a cell and press Enter or
          Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move a category that is already in the table: select its
          cell to pick it up, then select another cell to move it. To take a
          category out of the table, pick it up and use the &apos;Return the
          selected category to the list&apos; button.
        </p>

        {/* Tray of categories still to place. Also a drop target for removing. */}
        <section aria-label="Categories to place" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Categories to place
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">
                All categories are in the table.
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
                  className={`cursor-grab rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 active:cursor-grabbing ${
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
                Return the selected category to the list
              </button>
            )}
          </div>
        </section>

        {/* The table. Scrolls horizontally on narrow screens. */}
        <section aria-label="GDP measures table" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">
                Three ways of measuring GDP. Each column is a measure; drop each
                category into the correct cell.
              </caption>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="w-1/3 border border-slate-200 bg-slate-100 p-3 align-top text-sm font-semibold text-slate-700"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 1 ? "bg-slate-50" : ""}>
                    {row.map((cell, colIndex) => {
                      if (cell.type === "fixed") {
                        return (
                          <td
                            key={colIndex}
                            className="border border-slate-200 p-3 align-middle text-sm text-slate-800"
                          >
                            {cell.text}
                          </td>
                        );
                      }
                      if (cell.type === "empty") {
                        return (
                          <td
                            key={colIndex}
                            className="border border-slate-200 p-3 align-middle"
                          />
                        );
                      }
                      return (
                        <td
                          key={colIndex}
                          className="border border-slate-200 p-1 align-middle"
                        >
                          {renderZoneButton(cell)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
            {placedCount} of {ZONES.length} categories placed
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
                  Perfect – every category is in the right place.
                </p>
                <p>
                  The three measures should all come to the same total. On the
                  expenditure basis, GDP is consumption plus investment plus
                  government spending plus exports, minus imports – which is why
                  imports sit under the &apos;Minus:&apos; label. The income basis
                  adds up the incomes earned in production, and the output basis
                  adds up what each sector produces, valued at basic prices so that
                  it excludes taxes on goods and services.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
                <p>
                  You have {correctCount} out of {ZONES.length} categories in the
                  right place. The cells outlined in red are not right yet – adjust
                  them and check again.
                </p>
                <p>
                  Tip: first decide which measure each category belongs to –
                  expenditure, income or output. Remember that imports are
                  subtracted, so they belong under the &apos;Minus:&apos; label in
                  the expenditure column.
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

export default ComponentsOfGdp;
