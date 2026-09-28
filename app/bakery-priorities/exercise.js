"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// A ranking drag-and-drop. The student drags five actions a village bakery
// could take into rank slots 1 (most important) to 5 (least important). There
// is no single correct order, so this is not graded: on submitting we reveal a
// suggested ranking and the discussion feedback, leaving the student's own
// ranking in place so they can compare. The arrangement is saved to
// localStorage so it survives a refresh of the Canvas iframe.
// ---------------------------------------------------------------------------

// The five actions, in the order they first appear in the tray.
const TILES = [
  { id: "provide-info", label: "Provide workers with information on support available" },
  { id: "source-cheaper", label: "Source lower cost raw materials to keep costs down" },
  { id: "reduce-range", label: "Reduce the range of products sold" },
  { id: "increase-wages", label: "Increase wages for workers" },
  { id: "lower-prices", label: "Lower prices" },
];

// The rank slots the actions are dropped into.
const RANKS = [
  { key: "rank-1", n: 1, note: "Most important" },
  { key: "rank-2", n: 2, note: "" },
  { key: "rank-3", n: 3, note: "" },
  { key: "rank-4", n: 4, note: "" },
  { key: "rank-5", n: 5, note: "Least important" },
];

// The suggested ranking revealed after submitting (from the activity's answer
// key). It is only a suggestion: the feedback explains why the order is open.
const SUGGESTED = [
  "increase-wages",
  "source-cheaper",
  "reduce-range",
  "provide-info",
  "lower-prices",
];

const RANK_KEYS = RANKS.map((r) => r.key);
const POSITION_BY_KEY = Object.fromEntries(RANKS.map((r) => [r.key, `rank ${r.n}`]));
const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t]));

const STORAGE_KEY = "bakery-priorities:v1";

function makeInitialLocations() {
  return Object.fromEntries(TILES.map((t) => [t.id, "tray"]));
}

const BakeryPriorities = () => {
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
          if (value === "tray" || RANK_KEYS.includes(value)) next[tile.id] = value;
        }
        setLocations(next);
      }
    } catch {
      // localStorage may be unavailable; start from an empty ranking.
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

  const tileAtZone = (zoneKey) => TILES.find((t) => locations[t.id] === zoneKey) || null;
  const trayTiles = TILES.filter((t) => locations[t.id] === "tray");
  const placedCount = TILES.length - trayTiles.length;
  const allPlaced = trayTiles.length === 0;

  const announce = (message) => setAnnouncement(message);

  // Any change to the arrangement clears the "submitted" state.
  const applyLocations = (updater) => {
    setLocations(updater);
    setSubmitted(false);
  };

  // --- Placement logic (shared by click, keyboard and drag) ----------------

  // Move a tile into a rank slot, swapping with any occupant.
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
        `Picked up ${TILE_BY_ID[tileId].label}. Move to a rank and press Enter or Space to place it.`
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
        announce(`Kept ${selectedLabel} at ${position}.`);
        return;
      }
      placeTile(selected, zoneKey);
      announce(
        occupant
          ? `Placed ${selectedLabel} at ${position}, swapping with ${occupant.label}.`
          : `Placed ${selectedLabel} at ${position}.`
      );
      setSelected(null);
      setFocusTarget({ kind: "zone", key: zoneKey });
      return;
    }

    if (occupant) {
      setSelected(occupant.id);
      announce(
        `Picked up ${occupant.label} from ${position}. Move to another rank to place it.`
      );
    } else {
      announce(`${position} is empty. Pick up an action first.`);
    }
  };

  const returnSelectedToTray = () => {
    if (!selected || locations[selected] === "tray") return;
    const tileId = selected;
    applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
    announce(`Returned ${TILE_BY_ID[tileId].label} to the actions.`);
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
      announce(`Placed ${TILE_BY_ID[tileId].label} at ${POSITION_BY_KEY[zoneKey]}.`);
    }
  };

  const handleTrayDrop = (event) => {
    event.preventDefault();
    const tileId = event.dataTransfer.getData("text/plain");
    if (tileId && TILE_BY_ID[tileId] && locations[tileId] !== "tray") {
      applyLocations((prev) => ({ ...prev, [tileId]: "tray" }));
      announce(`Returned ${TILE_BY_ID[tileId].label} to the actions.`);
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
    announce("Your ranking has been submitted. A suggested ranking and feedback are shown below.");
  };

  const handleReset = () => {
    setLocations(makeInitialLocations());
    setSelected(null);
    setSubmitted(false);
    setDragOverKey(null);
    announce("The ranking has been reset. All actions are back in the list.");
  };

  // --- Rendering -----------------------------------------------------------

  // Render the drop slot that sits in each rank row.
  const renderZoneButton = (zoneKey) => {
    const tile = tileAtZone(zoneKey);
    const isSelectedHere = tile && selected === tile.id;
    const isDropTarget = dragOverKey === zoneKey;

    let stateClasses;
    if (tile) {
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
        className={`flex min-h-[56px] w-full items-center justify-center rounded-md p-3 text-center text-sm font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 ${stateClasses}`}
      >
        {tile ? tile.label : selected ? "Drop here" : "Empty"}
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
            Ranking a bakery&apos;s priorities
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              A business runs a bakery in a small village and hires a small group
              of workers from the local community. The local flour mill has shut
              down, putting a high number of people into unemployment, and there
              is a low probability of them gaining employment in the near future.
              These are the bakery&apos;s customers. The local community is facing
              a cost-of-living crisis.
            </p>
            <p>
              Consider the following five actions the bakery can take in response
              to the local cost-of-living crisis.
            </p>
            <p className="font-semibold text-slate-900">
              Rank the actions according to how you think they should be
              prioritised by the bakery. Rank 1 is the most important priority and
              rank 5 is least important.
            </p>
          </div>
        </header>

        {/* How to interact */}
        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
          Drag an action into a rank, or use your keyboard: move to an action and
          press Enter or Space to pick it up, then move to a rank and press Enter
          or Space to drop it in.
        </p>
        <p className="sr-only">
          You can also move an action that is already ranked: select its rank to
          pick it up, then select another rank to move it. To take an action out
          of the ranking, pick it up and use the &apos;Return the selected action
          to the list&apos; button.
        </p>

        {/* Tray of actions still to place. Also a drop target for removing. */}
        <section aria-label="Actions to rank" className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Actions to rank
          </h2>
          <div
            onDragOver={allowDrop}
            onDrop={handleTrayDrop}
            className="mt-2 flex min-h-[64px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            {trayTiles.length === 0 ? (
              <p className="text-sm text-slate-500">All actions have been ranked.</p>
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
                Return the selected action to the list
              </button>
            )}
          </div>
        </section>

        {/* The rank slots. */}
        <section aria-label="Ranking" className="mt-6">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Ranking from 1 (most important) to 5 (least important). Drop each
              action into a rank.
            </caption>
            <tbody>
              {RANKS.map((rank) => (
                <tr key={rank.key}>
                  <th
                    scope="row"
                    className="w-24 border border-slate-200 bg-slate-100 p-3 text-left align-middle"
                  >
                    <span className="text-lg font-bold text-slate-800">{rank.n}</span>
                    {rank.note && (
                      <span className="block text-xs font-medium text-slate-500">
                        {rank.note}
                      </span>
                    )}
                  </th>
                  <td className="border border-slate-200 p-2 align-middle">
                    {renderZoneButton(rank.key)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allPlaced}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Submit ranking
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
            {placedCount} of {TILES.length} ranked
          </p>
        </div>

        {/* Suggested ranking and feedback shown after submitting. */}
        {submitted && (
          <div
            role="region"
            aria-label="Suggested solution"
            className="mt-6 rounded-xl border-2 border-slate-300 bg-slate-100 p-5"
          >
            <h2 className="text-lg font-bold text-slate-900">Suggested ranking</h2>
            <p className="mt-2 text-sm text-slate-600">
              There is no single right answer. Your own ranking is saved above so
              you can compare it with this suggested order.
            </p>
            <ol className="mt-3 space-y-2">
              {SUGGESTED.map((id, index) => (
                <li key={id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-800 sm:text-base">
                    {TILE_BY_ID[id].label}
                  </span>
                </li>
              ))}
            </ol>

            <h3 className="mt-5 text-base font-bold text-slate-900">Feedback</h3>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
              <p>
                There is no hard and fast order for this, so this is a suggested
                ranking. It is hard to determine what the best course of action for
                the bakery is without having sight of their business accounts and
                knowing more about the market. It is clear that the crisis will
                affect their bakery in different ways. Firstly, demand may fall as
                people have less disposable income. So the bakery will want to find
                ways to maintain demand, through lower prices (potentially with
                lower quality ingredients) and expanding the population that the
                bakery sells through (for example wider advertising in other
                villages, selling online). Of course the bakery will need to make
                sure that these actions are profitable.
              </p>
              <p>
                The second impact on the business is on the production side. If the
                local mill supplied flour before, the bakery will need to find a
                new source which may be more expensive (assuming before they were
                buying the cheapest option). It may also make profit sense to
                reduce the range of products sold to keep costs down when demand
                for the wider range is limited. If demand falls significantly the
                bakery may need to reduce production, requiring an assessment of
                which costs are variable (for example electricity) and can be
                reduced and which are fixed (for example repaying a loan to buy
                ovens).
              </p>
              <p>
                As you can see there is a lot for the business to consider. The
                workers in the shop will value having a job, relative to their
                neighbours, so there may be scope to reduce costs by paying them
                less which could facilitate lower prices. Some may be considering
                moving to another job in a different place, and a higher wage from
                the bakery may persuade good and well-trained staff to stay. They
                may be worried about also losing their job and, as an employer, the
                bakery may want to provide them with information about what support
                is available if this happens. That may be relevant for the
                workers&apos; families as well. The priorities will no doubt depend
                on what is most urgent, what has biggest benefit at least cost and
                what can be done most quickly.
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

export default BakeryPriorities;
