"use client";

import React, { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// A reflective matrix poll. For each market the student rates how competitive
// they think it is on a 1 to 5 scale (1 = perfect competition, 5 = monopoly).
// There is no right answer: it is a guess based on common knowledge. On
// submitting we show the feedback, which discusses the key factors for each
// market. Choices are saved to localStorage so the poll survives a refresh of
// the Canvas iframe.
//
// If you have the URL of the Alibaba article, set ALIBABA_URL below and its
// title in the feedback becomes a link (opening in a new tab).
// ---------------------------------------------------------------------------
const ALIBABA_URL = "";

// The 1 to 5 competition scale used for every market.
const COLUMNS = [
  { key: "1", label: "1 (Perfect competition)" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5", label: "5 (Monopoly)" },
];

// The markets the student rates, each a sector in a particular place.
const SECTORS = [
  { id: "postal-germany", label: "Postal and courier services, Germany" },
  { id: "online-china", label: "Online shopping, China" },
  { id: "airports-london", label: "Airports, London" },
  { id: "narcotics-colombia", label: "Drug (narcotics) market, Colombia" },
  { id: "vaccine-global", label: "Covid-19 vaccine market, global" },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "market-competition:v1";

const MarketCompetition = () => {
  // Map of market id to the chosen score key (or undefined if not answered).
  const [responses, setResponses] = useState({});
  // Whether the poll has been submitted (shows the feedback).
  const [submitted, setSubmitted] = useState(false);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");

  // Load any saved choices once, after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = {};
        for (const sector of SECTORS) {
          if (COLUMN_KEYS.includes(saved[sector.id])) next[sector.id] = saved[sector.id];
        }
        setResponses(next);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty poll.
    }
  }, []);

  // Persist choices whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    } catch {
      // Ignore storage failures.
    }
  }, [responses]);

  const answeredCount = SECTORS.filter((s) => responses[s.id]).length;
  const allAnswered = answeredCount === SECTORS.length;

  // Record a choice. Changing an answer clears the feedback so the student can
  // resubmit once they are happy with their choices.
  const handleSelect = (sectorId, columnKey) => {
    setResponses((prev) => ({ ...prev, [sectorId]: columnKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement("Thank you. Feedback is shown below.");
  };

  const handleReset = () => {
    setResponses({});
    setSubmitted(false);
    setAnnouncement("The poll has been reset. All responses have been cleared.");
  };

  return (
    // min-h-full (never min-h-screen) so the poll fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Introduction */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How competitive is each market?
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              In the table below you can see a list of sectors and countries.
              Based on what you know about them, think about how competitive you
              think they are.
            </p>
            <p className="font-semibold text-slate-900">
              For each sector in the specified country, choose a number between 1
              and 5 to indicate how competitive you think it is (1 = perfect
              competition, 5 = monopoly).
            </p>
            <p className="text-slate-600">
              This is a poll, so there are no right or wrong answers – it is a
              guess based on common knowledge. Feedback appears when you submit.
            </p>
          </div>
        </header>

        {/* The poll. Each row is a radio group; only one score can be picked per
            market. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Market competition poll" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">
                For each market, choose a score from 1 (perfect competition) to 5
                (monopoly).
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Market
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="bg-slate-800 p-4 align-top text-center text-sm font-semibold text-white"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTORS.map((sector) => (
                  <tr key={sector.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
                    >
                      {sector.label}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[sector.id] === column.key;
                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${
                            isChosen ? "bg-violet-50" : "bg-white"
                          }`}
                        >
                          {/* The whole cell is a clickable label around the radio.
                              The aria-label names the market and the score. */}
                          <label className="flex cursor-pointer items-center justify-center p-4">
                            <input
                              type="radio"
                              name={sector.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(sector.id, column.key)}
                              aria-label={`${sector.label}: rated ${column.label}`}
                              className="h-5 w-5 accent-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
                            />
                          </label>
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
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Submit responses
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            Clear
          </button>
          <p className="text-sm text-slate-600" aria-live="polite">
            {answeredCount} of {SECTORS.length} answered
          </p>
        </div>

        {/* Feedback shown after submitting. */}
        {submitted && (
          <div
            role="region"
            aria-label="Feedback"
            className="mt-6 rounded-xl border-2 border-slate-300 bg-slate-100 p-5"
          >
            <h2 className="text-lg font-bold text-slate-900">Feedback</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
              <p>
                Whilst there is no correct answer to where you put each market,
                especially given the absence of evidence provided, there are some
                key factors to bear in mind that influence how close to each end
                of the spectrum you would go.
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  German postal and courier services.
                </span>{" "}
                Under EU legislation postal services are liberalised. That means
                that they are open to competition and governments and regulators
                issue licences to new entrants who compete with what are often
                long established incumbents (such as Deutsche Post in Germany).
                There have been a number of anti-competitive investigations
                against Deutsche Post, suggesting competition is not perfect, but
                there are other players serving customers, especially in large
                cities and in parcel courier services. This suggests that it is
                not close to monopoly. It may be a 3 or a 4.
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Online shopping, China.
                </span>{" "}
                Alibaba is the largest online shopping platform in China. But it
                is not a monopoly as there are other players in the market and
                there is a constraint from consumers. Both existing rivals and
                potential entrants have in recent months built their share in the
                market, as discussed in this article:{" "}
                {ALIBABA_URL ? (
                  <a
                    href={ALIBABA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-700 underline hover:text-violet-800"
                  >
                    Alibaba risks dominance in China as shoppers evolve
                  </a>
                ) : (
                  <span className="font-medium">
                    &apos;Alibaba risks dominance in China as shoppers evolve&apos;
                  </span>
                )}
                . It used to be considered a 4 but may be more like a 3.
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Airports, London.
                </span>{" "}
                London airports are considered competitive with the exception of
                Heathrow which has its own special characteristics as a hub
                airport. What makes this airport market competitive? First there
                is a constraint from customers – both passengers and airlines –
                who shop around for the lowest price option considering the
                transport cost to get to the airport, price of parking (if
                driving), services available, quality of service and flight cost
                (which depends on the airport charges paid by the airline). The
                airports constrain each other – there is rivalry – working to
                attract more passengers (and airlines) to their airport. There is
                also a constraint from other forms of public transport on some
                flights (for example within the UK and to mainland Europe – think
                Eurostar and ferry and car options). It is probably a 2, with
                Heathrow being more of a 3.
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Colombia narcotics.
                </span>{" "}
                The Colombia drugs market is run by a cartel. This means the
                outcomes are monopoly outcomes, even though there is more than one
                player in the market. It is as close as any of these markets to a
                5.
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Covid-19 vaccine market.
                </span>{" "}
                As I am sure you know there is more than one vaccine producer
                globally, with some pharmaceutical companies operating across the
                world and others only operating in some regions. We don&apos;t
                have a monopoly. The number of companies is small however. This is
                not surprising if you consider the need to have scale economies
                and available profits to invest in successful R&amp;D. There are
                also entry barriers from patents and regulatory requirements that
                limit the number of companies in the market. Constraints from
                consumers who will have a vaccine no matter what are limited (they
                would be inelastic) but any consumer who would choose to not be
                vaccinated if they identified a risk with a particular brand would
                be more of a constraint (elastic). The market globally is probably
                a 2 or 3.
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

export default MarketCompetition;
