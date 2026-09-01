"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// A table drag-and-drop. Each row names a term (balance of trade, current
// account balance, and so on) and the student places two definitions per row:
// the item on the 'equals this' (plus) side and the item on the 'minus this'
// side. Every definition belongs to exactly one cell, so grading is exact-cell.
//
// On checking, each cell is marked and the full feedback text is displayed.
// ---------------------------------------------------------------------------
const COLUMNS = [
  { key: "term", header: "Term" },
  { key: "equals", header: "Equals this" },
  { key: "minus", header: "Minus this" },
];

// Rows in reading order. Fixed cells hold the term; zone cells are filled by
// the student.
const TABLE = [
  [
    { type: "fixed", text: "Balance of trade" },
    { type: "zone", key: "bot-eq", correct: "exports", position: "Balance of trade, equals this" },
    { type: "zone", key: "bot-mi", correct: "imports", position: "Balance of trade, minus this" },
  ],
  [
    { type: "fixed", text: "Current account balance" },
    { type: "zone", key: "cab-eq", correct: "exports-income", position: "Current account balance, equals this" },
    { type: "zone", key: "cab-mi", correct: "imports-income", position: "Current account balance, minus this" },
  ],
  [
    { type: "fixed", text: "Financial account balance" },
    { type: "zone", key: "fab-eq", correct: "sales-assets", position: "Financial account balance, equals this" },
    { type: "zone", key: "fab-mi", correct: "purchases-assets", position: "Financial account balance, minus this" },
  ],
  [
    { type: "fixed", text: "Government deficit" },
    { type: "zone", key: "gd-eq", correct: "gov-spending", position: "Government deficit, equals this" },
    { type: "zone", key: "gd-mi", correct: "tax-revenues", position: "Government deficit, minus this" },
  ],
];

// The eight draggable definitions, in the order they first appear in the tray
// (matching the original activity's answer-tile list).
const TILES = [
  { id: "gov-spending", label: "Government spending (direct spending on goods and services, plus transfers)" },
  { id: "imports", label: "Imports of goods and services" },
  { id: "purchases-assets", label: "Purchases of financial assets (shares, bonds, etc.) from abroad and lending to foreigners" },
  { id: "imports-income", label: "Imports of goods and services, plus income sent abroad from workers and investments in this country" },
  { id: "exports", label: "Exports of goods and services" },
  { id: "exports-income", label: "Exports of goods and services, plus income from this country's workers and investments abroad" },
  { id: "tax-revenues", label: "Tax revenues, profits of nationalised companies and revenues from selling assets" },
  { id: "sales-assets", label: "Sales of financial assets (shares, bonds, etc.) to foreigners and borrowing from abroad" },
];

const ZONES = TABLE.flat().filter((cell) => cell.type === "zone");
const ZONE_KEYS = ZONES.map((z) => z.key);
const CORRECT_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.correct]));
const POSITION_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.position]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));

const STORAGE_KEY = "me10-7-international-balances:v1";

function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

const InternationalBalances = () => {
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
  const allCorrect = submitted && correctCount === ZONES.length;

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
        announce(`Kept ${selectedLabel} in ${position}.`);
        return;
      }
      placeTile(selected, zoneKey);
      announce(
        occupant
          ? `Placed ${selectedLabel} in ${position}, swapping with ${occupant.label}.`
          : `Placed ${selectedLabel} in ${position}.`
      );
      setSelected(null);
      setFocusTarget({ kind: "zone", key: zoneKey });
      return;
    }

    if (occupant) {
      setSelected(occupant.id);
      announce(
        `Picked up ${occupant.label} from ${position}. Move to another cell to place it.`
      );
    } else {
      announce(`${position} is empty. Pick up a definition first.`);
    }
  };

  const returnSelectedToTray = () => {
    if (!selected || locations[selected] === "tray") return;
    const tileId = selected;
    applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
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
      correctCount === ZONES.length
        ? "Well done, every definition is in the right place. Feedback is shown below."
        : `You have ${correctCount} out of ${ZONES.length} definitions in the right place. Feedback is shown below.`
    );
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The table has been reset. All definitions are back in the list.");
  };

  // --- Rendering -----------------------------------------------------------

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
        className={`flex min-h-[64px] w-full items-start gap-1.5 rounded-md p-2 text-left text-sm font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 ${stateClasses}`}
      >
        {tile && submitted && (isRight ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-700" aria-hidden="true" />
        ) : (
          <XCircle className="mt-0.5 h-4 w-4 flex-none text-rose-700" aria-hidden="true" />
        ))}
        <span>{tile ? tile.label : ""}</span>
      </button>
    );
  };

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Scenario and instructions */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            International balances
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              Remember that the balance of payments has three components: the
              current account, the capital account and the financial account. The
              three components should add up to zero, although in practice there is
              usually a balancing item to offset errors in the data. The capital
              account is also usually small and I have left it out of this exercise.
            </p>
            <p>
              The accounting convention for the balance of payments is that money
              coming into the country is counted as positive and money leaving it
              is negative. The government deficit (or its opposite, the government
              surplus) is not part of the balance of payments, but is linked to it
              in a way that we will soon discover.
            </p>
            <p className="font-semibold text-slate-900">
              Move each definition to the correct place in the table, showing which
              term it relates to and whether it is on the &apos;equals this&apos;
              (plus) side or the &apos;minus this&apos; side.
            </p>
          </div>
        </header>

        {/* How to interact */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag a definition into a cell, or use your keyboard: move to a definition
          and press Enter or Space to pick it up, then move to a cell and press
          Enter or Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move a definition that is already in the table: select its
          cell to pick it up, then select another cell to move it. To take a
          definition out of the table, pick it up and use the &apos;Return the
          selected definition to the list&apos; button.
        </p>

        {/* Tray of definitions still to place. Also a drop target for removing. */}
        <section aria-label="Definitions to place" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Definitions to place
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">
                All definitions are in the table.
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
                  className={`max-w-full cursor-grab rounded-lg border-2 px-3 py-2 text-left text-sm font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 active:cursor-grabbing ${
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
                Return the selected definition to the list
              </button>
            )}
          </div>
        </section>

        {/* The table. Scrolls horizontally on narrow screens. */}
        <section aria-label="International balances table" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">
                For each term, drop the definition on the &apos;equals this&apos;
                (plus) side and the definition on the &apos;minus this&apos; side.
              </caption>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="border border-slate-200 bg-slate-100 p-3 align-top text-sm font-semibold text-slate-700"
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
                          <th
                            key={colIndex}
                            scope="row"
                            className="border border-slate-200 p-3 align-middle text-sm font-semibold text-slate-800"
                          >
                            {cell.text}
                          </th>
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
            {placedCount} of {ZONES.length} definitions placed
          </p>
        </div>

        {/* Feedback shown after submitting. The cells above are marked; the text
            explains the reasoning. */}
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
              <p className="font-semibold">
                I hope you got the definitions the correct way round.
              </p>
              <p>
                The balance of trade is exports minus imports, since selling exports
                brings money into the country. The current balance adds income from
                abroad – remittances from your country&apos;s workers in foreign
                countries and income (dividends and interest) from financial assets
                held abroad. It doesn&apos;t include the receipts from selling any
                financial assets to foreigners.
              </p>
              <p>
                Receipts from selling financial assets are part of the financial
                account, offset by the payments made to purchase similar assets from
                abroad.
              </p>
              <p>
                The government deficit is the excess of its spending over its tax and
                other revenues. The UK defines money from asset sales (such as
                privatisations) in the same way as tax revenues, even though an asset
                can only be sold once and might be seen as a way of financing a
                deficit, rather than making the deficit smaller. Other countries may
                have a different accounting convention.
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

export default InternationalBalances;
