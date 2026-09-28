"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// A single-select matrix with a correct answer for each row. For each market
// condition the student decides whether it makes profitable price
// discrimination feasible or not feasible. On submitting, the correct answer
// for each row is shown with a green tick and a wrong choice is shown with a
// red cross, and the feedback explains the four conditions that need to hold.
// ---------------------------------------------------------------------------

// The two possible answers for every row.
const COLUMNS = [
  { key: "feasible", label: "Profitable price discrimination feasible" },
  { key: "not-feasible", label: "Profitable price discrimination not feasible" },
];

// Each market condition has one correct column. The correct answers follow the
// four conditions in the feedback below: market power, a variety of willingness
// to pay, being able to verify a characteristic, and no scope for resale.
const CONDITIONS = [
  {
    id: "many-firms",
    label: "There are many firms in the market with similar costs",
    // No market power, so any higher price is simply undercut by a rival.
    correct: "not-feasible",
  },
  {
    id: "resale",
    label:
      "Consumers are able to sell the product on eBay or similar platforms at a different price to what the firm charges",
    // Resale means arbitrage undoes the price difference.
    correct: "not-feasible",
  },
  {
    id: "few-firms",
    label: "There are a few firms in the market with different costs",
    // A few firms with different costs implies some market power.
    correct: "feasible",
  },
  {
    id: "proof",
    label:
      "Firm is able to require consumers to present proof of a particular characteristic to be able to offer a particular price",
    // Being able to verify a characteristic lets the firm target lower prices.
    correct: "feasible",
  },
  {
    id: "similar-wtp",
    label: "All consumers have a similar willingness to pay for a good",
    // With no variety in willingness to pay there is no scope to charge
    // different prices.
    correct: "not-feasible",
  },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "bpes-price-discrimination:v1";

const PriceDiscrimination = () => {
  // Map of condition id to the chosen column key (or undefined if not answered).
  const [responses, setResponses] = useState({});
  // Whether the answers have been checked (reveals correctness and feedback).
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
        for (const condition of CONDITIONS) {
          if (COLUMN_KEYS.includes(saved[condition.id])) next[condition.id] = saved[condition.id];
        }
        setResponses(next);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty grid.
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

  const answeredCount = CONDITIONS.filter((c) => responses[c.id]).length;
  const allAnswered = answeredCount === CONDITIONS.length;
  const correctCount = CONDITIONS.filter((c) => responses[c.id] === c.correct).length;
  const allCorrect = submitted && correctCount === CONDITIONS.length;

  // Record a choice. Changing an answer clears the marking so the student can
  // check again once they are happy.
  const handleSelect = (conditionId, columnKey) => {
    setResponses((prev) => ({ ...prev, [conditionId]: columnKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement(
      `You answered ${correctCount} of ${CONDITIONS.length} conditions correctly. Feedback is shown below.`
    );
  };

  const handleReset = () => {
    setResponses({});
    setSubmitted(false);
    setAnnouncement("The exercise has been reset. All answers have been cleared.");
  };

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Question */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            When is price discrimination feasible?
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              Charging different consumers different prices for the same product
              is not always feasible. In the table below, look at each market
              condition in the left column and indicate whether you think it
              would make profitable price discrimination feasible or not
              feasible, then check your answers.
            </p>
          </div>
        </header>

        {/* The grid. Each row is a radio group; only one answer can be picked per
            condition. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Price discrimination grid" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <caption className="sr-only">
                For each market condition, choose whether profitable price
                discrimination is feasible or not feasible.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Market condition
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
                {CONDITIONS.map((condition) => (
                  <tr key={condition.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
                    >
                      {condition.label}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[condition.id] === column.key;
                      const isCorrectCell = column.key === condition.correct;
                      const showTick = submitted && isCorrectCell;
                      const showCross = submitted && isChosen && !isCorrectCell;

                      // Cell background: green for the correct answer, red for a
                      // wrong choice, violet for a selection before checking.
                      let cellClass = "bg-white";
                      if (submitted && isCorrectCell) cellClass = "bg-emerald-50";
                      else if (submitted && isChosen) cellClass = "bg-rose-50";
                      else if (isChosen) cellClass = "bg-violet-50";

                      // Accessible description of the cell after checking.
                      let extra = "";
                      if (submitted && isCorrectCell) extra = " This is the correct answer.";
                      else if (submitted && isChosen) extra = " You chose this; it is not the correct answer.";

                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${cellClass}`}
                        >
                          <label className="flex cursor-pointer items-center justify-center gap-2 p-4">
                            <input
                              type="radio"
                              name={condition.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(condition.id, column.key)}
                              aria-label={`${condition.label}: ${column.label}.${extra}`}
                              className="h-5 w-5 accent-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
                            />
                            {showTick && (
                              <CheckCircle2 className="h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
                            )}
                            {showCross && (
                              <XCircle className="h-5 w-5 flex-none text-rose-700" aria-hidden="true" />
                            )}
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
            Check answers
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            Clear
          </button>
          <p className="text-sm text-slate-600" aria-live="polite">
            {answeredCount} of {CONDITIONS.length} answered
          </p>
        </div>

        {/* Feedback shown after checking. */}
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
                You answered {correctCount} of {CONDITIONS.length} conditions
                correctly. The correct answer for each condition is marked with a
                green tick.
              </p>
              <p>
                For a firm to be able to price discriminate they need to have
                market power. If there are other firms in the market selling the
                same product with the same cost, any attempt at price
                discrimination will result in under-cutting of any higher price
                options and consumers will not take advantage of them. For
                example, if any airline sold a high fare for business and a low
                fare for economy, without any difference other than where your
                seat was and when you got to board, another airline could offer
                low fares to all passengers and those who are offered high fare
                would switch to the alternative airline. However, if an airline
                was the only one operating on a route and there was no risk of
                anyone entering (for example there were no slots available to
                land at the destination airport) then the price discrimination
                would be feasible.
              </p>
              <p>
                The next most important characteristic is that there is a variety
                of willingness to pay across consumers. If consumers are very
                similar, there is no scope to charge them different prices.
              </p>
              <p>
                The firm also needs to ensure that they are charging lower prices
                to those who meet particular characteristics and need to have a
                way of those consumers proving their characteristics, or
                self-selecting into an option revealing their characteristic. For
                example, if a cinema charges lower prices to students they will
                need someone to provide student ID to be able to take advantage
                of the offer. If this is not feasible, for example they
                don&apos;t have the staff to check the IDs, then anyone could book
                the lower ticket and not pay the higher price that they are
                supposed to pay and the price discrimination strategy may not be
                profitable anymore.
              </p>
              <p>
                A final important condition is that consumers cannot sell on the
                product to others at a different price. This is necessary to
                ensure there is no scope for arbitrage. For example, if someone
                could buy at a lower price and then sell at a mark-up (but less
                than the highest price) to someone who is only eligible for a
                higher price, the firm cannot price discriminate profitably. If a
                firm sold six packs of a soft drink at a discount relative to
                buying the drinks separately, to provide a deal for consumers who
                like the drink, they need to be able to stop someone from buying
                the six pack and selling the individual drinks separately at a
                price just below their individual item drink. Otherwise the
                resale market would stop those buying separate drinks from buying
                from the firm, losing them profit. This is why multi-pack buys
                often have a label &apos;not to be sold individually&apos; or
                similar on the packaging to prevent this type of reselling.
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

export default PriceDiscrimination;
