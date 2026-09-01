"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// A positioning-map drag-and-drop. Students drag eight car manufacturers onto a
// perceptual map with two axes (sporty to conservative, affordable to
// exclusive). The slots are fixed at sensible positions; the task is to decide
// which brand belongs in each. Positioning is a matter of judgement, so the tool
// does not mark answers right or wrong: on submitting it reveals one suggested
// solution underneath for comparison.
//
// The map is drawn on a fixed pixel canvas so the axes (in an SVG) and the drop
// zones (absolutely positioned buttons) always line up; it scrolls horizontally
// on narrow screens.
// ---------------------------------------------------------------------------
// Extra width on the right leaves room for the long "Conservative" axis label.
const CANVAS = { width: 860, height: 560 };
const CENTRE = { x: 390, y: 285 };
const TEAL = "#0d9488";

// The eight drop zones, positioned to match the suggested solution. `correct`
// is the brand shown in that slot when the solution is revealed; `position`
// describes the slot in words for screen reader users.
const ZONES = [
  { key: "z-ferrari", x: 194, y: 138, correct: "ferrari", position: "top-left area: sporty and exclusive" },
  { key: "z-rr", x: 628, y: 107, correct: "rolls-royce", position: "top-right area: conservative and highly exclusive" },
  { key: "z-mercedes", x: 530, y: 180, correct: "mercedes", position: "upper-right area: conservative and exclusive" },
  { key: "z-audi", x: 292, y: 239, correct: "audi", position: "left of centre: slightly sporty and slightly exclusive" },
  { key: "z-vw", x: 502, y: 260, correct: "volkswagen", position: "right of centre: slightly conservative" },
  { key: "z-honda", x: 300, y: 369, correct: "honda", position: "lower-left area: sporty and affordable" },
  { key: "z-toyota", x: 488, y: 352, correct: "toyota", position: "lower-right of centre: conservative and affordable" },
  { key: "z-kia", x: 474, y: 422, correct: "kia", position: "bottom area: conservative and affordable" },
];

// The eight draggable brands, in the order they first appear in the tray
// (matching the original activity).
const TILES = [
  { id: "honda", label: "Honda" },
  { id: "rolls-royce", label: "Rolls Royce" },
  { id: "mercedes", label: "Mercedes" },
  { id: "toyota", label: "Toyota" },
  { id: "kia", label: "Kia" },
  { id: "ferrari", label: "Ferrari" },
  { id: "audi", label: "Audi" },
  { id: "volkswagen", label: "Volkswagen" },
];

// Axis labels, positioned around the ends of the arrows.
const AXIS_LABELS = [
  { text: "Exclusive", x: CENTRE.x, y: 48 },
  { text: "Affordable", x: CENTRE.x, y: 522 },
  { text: "Sporty", x: 56, y: CENTRE.y },
  { text: "Conservative", x: 762, y: CENTRE.y },
];

const ZONE_KEYS = ZONES.map((z) => z.key);
const CORRECT_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.correct]));
const POSITION_BY_KEY = Object.fromEntries(ZONES.map((z) => [z.key, z.position]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));

const ZONE_W = 132;
const ZONE_H = 42;
const STORAGE_KEY = "mm4-4-positioning:v1";

function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

// Absolute-position style for a box centred on a point.
function atPoint(x, y, w, h) {
  return { position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h };
}

// Wraps the fixed-size map canvas and scales it down to fit the available
// width, so the whole map is always visible (no horizontal scroll) while the
// axes and boxes stay perfectly aligned. It never scales above 1.
function ScaledMap({ children, ariaLabel, className = "", innerClassName = "" }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const update = () => setScale(Math.min(1, element.clientWidth / CANVAS.width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden ${className}`}
      style={{ height: CANVAS.height * scale }}
    >
      <div
        role="group"
        aria-label={ariaLabel}
        className={`relative ${innerClassName}`}
        style={{
          width: CANVAS.width,
          height: CANVAS.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const PositioningMap = () => {
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
      // localStorage may be unavailable; start from an empty map.
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

  const announce = (message) => setAnnouncement(message);

  const applyLocations = (updater) => {
    setLocations(updater);
    setSubmitted(false);
  };

  // --- Placement logic (shared by click, keyboard and drag) ----------------

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
        `Picked up ${TILE_BY_ID[tileId].label}. Move to a slot on the map and press Enter or Space to drop it.`
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
        `Picked up ${occupant.label} from the ${position}. Move to another slot to place it.`
      );
    } else {
      announce(`The ${position} is empty. Pick up a brand first.`);
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
    announce("Thank you. A suggested solution is shown below your map.");
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The map has been reset. All brands are back in the list.");
  };

  // --- Rendering -----------------------------------------------------------

  // The axes and labels, shared by the interactive map and the solution map.
  const renderAxes = (idSuffix) => (
    <>
      <svg
        width={CANVAS.width}
        height={CANVAS.height}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          <marker
            id={`arrow-${idSuffix}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={TEAL} />
          </marker>
        </defs>
        {/* Horizontal axis (sporty to conservative) */}
        <line
          x1="110"
          y1={CENTRE.y}
          x2="670"
          y2={CENTRE.y}
          stroke={TEAL}
          strokeWidth="4"
          markerStart={`url(#arrow-${idSuffix})`}
          markerEnd={`url(#arrow-${idSuffix})`}
        />
        {/* Vertical axis (affordable to exclusive) */}
        <line
          x1={CENTRE.x}
          y1="75"
          x2={CENTRE.x}
          y2="495"
          stroke={TEAL}
          strokeWidth="4"
          markerStart={`url(#arrow-${idSuffix})`}
          markerEnd={`url(#arrow-${idSuffix})`}
        />
      </svg>
      {AXIS_LABELS.map((label) => (
        <div
          key={label.text}
          style={atPoint(label.x, label.y, 140, 24)}
          className="pointer-events-none flex items-center justify-center text-sm font-bold uppercase tracking-wide text-slate-600"
        >
          {label.text}
        </div>
      ))}
    </>
  );

  const renderZone = (zone) => {
    const tile = tileAtZone(zone.key);
    const isSelectedHere = tile && selected === tile.id;
    const isDropTarget = dragOverKey === zone.key;

    let stateClasses;
    if (tile) {
      stateClasses = `border-2 bg-violet-100 text-violet-900 ${
        isSelectedHere
          ? "border-violet-600 ring-2 ring-violet-600"
          : "border-violet-300 hover:bg-violet-200"
      }`;
    } else {
      stateClasses = `border-2 border-dashed ${
        selected ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-400 bg-slate-100 text-slate-500"
      }`;
    }
    if (isDropTarget) stateClasses += " ring-2 ring-violet-500 border-violet-500";

    let label = `Slot in the ${zone.position}.`;
    label += tile ? ` Contains ${tile.label}.` : " Empty.";
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
        onClick={() => handleZoneClick(zone.key)}
        aria-label={label}
        style={atPoint(zone.x, zone.y, ZONE_W, ZONE_H)}
        className={`z-10 flex items-center justify-center rounded-md px-1 text-center text-sm font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 ${stateClasses}`}
      >
        {tile ? tile.label : ""}
      </button>
    );
  };

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Instructions */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Positioning map
          </h1>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
            Drag and drop each car manufacturer into the appropriate position on the
            map, from sporty to conservative and from affordable to exclusive.
          </p>
        </header>

        {/* How to interact */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag a brand onto a slot, or use your keyboard: move to a brand and press
          Enter or Space to pick it up, then move to a slot on the map and press
          Enter or Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move a brand that is already on the map: select its slot to
          pick it up, then select another slot. To take a brand off the map, pick
          it up and use the &apos;Return the selected brand to the list&apos;
          button.
        </p>

        {/* Tray of brands still to place. Also a drop target for removing. */}
        <section aria-label="Brands to place" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Brands to place
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">All brands are on the map.</p>
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
                  className={`cursor-grab rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 active:cursor-grabbing sm:text-base ${
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
                className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
              >
                Return the selected brand to the list
              </button>
            )}
          </div>
        </section>

        {/* The interactive map. */}
        <section aria-label="Positioning map" className="mt-6">
          <ScaledMap ariaLabel="Positioning map. Horizontal axis from sporty on the left to conservative on the right; vertical axis from affordable at the bottom to exclusive at the top.">
            {renderAxes("map")}
            {ZONES.map((zone) => renderZone(zone))}
          </ScaledMap>
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

        {/* Suggested solution, revealed after submitting. */}
        {submitted && (
          <div
            role="region"
            aria-label="Suggested solution"
            className="mt-6 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-5"
          >
            <h2 className="text-lg font-bold text-slate-900">Suggested solution</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-800 sm:text-base">
              Thank you. Here is one common way of positioning these brands – compare
              it with your own map. Positioning is a matter of judgement, so your map
              may differ and still be perfectly reasonable.
            </p>
            <ScaledMap
              ariaLabel="Suggested positioning of the brands on the map."
              className="mt-4"
              innerClassName="rounded-lg bg-white"
            >
              {renderAxes("solution")}
              {ZONES.map((zone) => (
                <div
                  key={zone.key}
                  style={atPoint(zone.x, zone.y, ZONE_W, ZONE_H)}
                  className="z-10 flex items-center justify-center rounded-md border-2 border-teal-600 bg-teal-50 px-1 text-center text-sm font-semibold leading-tight text-teal-900"
                >
                  {TILE_BY_ID[CORRECT_BY_KEY[zone.key]].label}
                </div>
              ))}
            </ScaledMap>
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

export default PositioningMap;
