"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// For each everyday example the student picks two things from dropdowns: the
// type of price discrimination and whether it raises a consumer welfare
// concern. On checking, each dropdown is marked with a green tick (correct) or
// a red cross (not the suggested answer), the suggested answer is shown when a
// choice is wrong, and the feedback explains each example.
//
// If you have the URL of the WH Smith hospital-pricing news report, set
// ARTICLE_URL below and its title in the feedback becomes a link (new tab).
// ---------------------------------------------------------------------------
const ARTICLE_URL = "";

// The three types of price discrimination, offered in every "type" dropdown.
const TYPE_OPTIONS = [
  { key: "first", label: "Individual pricing (first degree)" },
  { key: "third", label: "Group pricing (third degree)" },
  { key: "second", label: "Versioning (second degree)" },
];

// The three welfare-concern answers, offered in every "concern" dropdown.
const CONCERN_OPTIONS = [
  { key: "always", label: "Always a concern" },
  { key: "unlikely", label: "Unlikely to be a concern" },
  { key: "potential", label: "Potential concern — depends on prices and quantities and variation" },
];

// Each example has one suggested type and one suggested welfare concern.
const EXAMPLES = [
  {
    id: "haircuts",
    example: "Lower price for midweek morning haircuts in hairdressing salon",
    // Off-peak pricing: consumers self-select by when they attend (versioning).
    type: "second",
    concern: "unlikely",
  },
  {
    id: "mobile",
    example: "Lower data prices on mobile phone for those who buy handset as well",
    // Bundling/tying: consumers reveal willingness to pay through their choice.
    type: "second",
    concern: "potential",
  },
  {
    id: "water",
    example:
      "Water sold for higher prices in hospital or airport outlet relative to High Street outlet of same shop",
    // Group pricing by location: different groups identified by where they are.
    type: "third",
    concern: "potential",
  },
  {
    id: "market",
    example:
      "Stall at marketplace does not list prices but asks buyer to suggest what they are willing to pay",
    // Haggling: each consumer charged their own willingness to pay (first degree).
    type: "first",
    concern: "always",
  },
];

// Look up an option label by its key, for showing suggested answers.
const typeLabel = (key) => TYPE_OPTIONS.find((o) => o.key === key)?.label ?? "";
const concernLabel = (key) => CONCERN_OPTIONS.find((o) => o.key === key)?.label ?? "";

const TYPE_KEYS = TYPE_OPTIONS.map((o) => o.key);
const CONCERN_KEYS = CONCERN_OPTIONS.map((o) => o.key);
const TOTAL = EXAMPLES.length * 2; // two dropdowns per example
const STORAGE_KEY = "bpes-price-discrimination-types:v1";

const PriceDiscriminationTypes = () => {
  // Map of example id to { type, concern } chosen keys (either may be missing).
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
        for (const item of EXAMPLES) {
          const row = saved[item.id] || {};
          const clean = {};
          if (TYPE_KEYS.includes(row.type)) clean.type = row.type;
          if (CONCERN_KEYS.includes(row.concern)) clean.concern = row.concern;
          if (clean.type || clean.concern) next[item.id] = clean;
        }
        setResponses(next);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty table.
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

  // Count answered dropdowns and correct dropdowns across both columns.
  let answeredCount = 0;
  let correctCount = 0;
  for (const item of EXAMPLES) {
    const row = responses[item.id] || {};
    if (row.type) answeredCount += 1;
    if (row.concern) answeredCount += 1;
    if (row.type === item.type) correctCount += 1;
    if (row.concern === item.concern) correctCount += 1;
  }
  const allAnswered = answeredCount === TOTAL;
  const allCorrect = submitted && correctCount === TOTAL;

  // Record a choice. Changing an answer clears the marking so the student can
  // check again once they are happy.
  const handleSelect = (itemId, field, key) => {
    setResponses((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: key } }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement(
      `You matched ${correctCount} of ${TOTAL} answers to the suggested answer. Feedback is shown below.`
    );
  };

  const handleReset = () => {
    setResponses({});
    setSubmitted(false);
    setAnnouncement("The exercise has been reset. All answers have been cleared.");
  };

  // Render one dropdown cell (used for both the type and the concern columns).
  const renderSelect = (item, field, options, label) => {
    const chosen = responses[item.id]?.[field] || "";
    const correctKey = item[field];
    const isAnswered = Boolean(chosen);
    const isCorrect = chosen === correctKey;
    const showTick = submitted && isCorrect;
    const showCross = submitted && isAnswered && !isCorrect;

    // Cell background: green when correct, red when a wrong answer is chosen.
    let cellClass = "bg-white";
    if (submitted && isCorrect) cellClass = "bg-emerald-50";
    else if (submitted && isAnswered) cellClass = "bg-rose-50";

    const suggested = field === "type" ? typeLabel(correctKey) : concernLabel(correctKey);

    return (
      <td className={`border border-slate-200 p-3 align-top ${cellClass}`}>
        <div className="flex items-start gap-2">
          <select
            value={chosen}
            onChange={(event) => handleSelect(item.id, field, event.target.value)}
            aria-label={`${item.example}: ${label}`}
            className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Select an answer
            </option>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          {showTick && (
            <CheckCircle2 className="mt-2 h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
          )}
          {showCross && (
            <XCircle className="mt-2 h-5 w-5 flex-none text-rose-700" aria-hidden="true" />
          )}
        </div>
        {/* When a choice is wrong, show the suggested answer beneath it. */}
        {showCross && (
          <p className="mt-2 text-xs font-medium text-emerald-800">
            Suggested answer: {suggested}
          </p>
        )}
      </td>
    );
  };

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Question */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Types of price discrimination
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              For each example, choose what type of price discrimination is being
              used and whether you think it poses a concern for consumer welfare,
              then check your answers.
            </p>
          </div>
        </header>

        {/* The table. Each example has a dropdown for the type and one for the
            welfare concern. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Price discrimination examples" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] table-fixed border-collapse text-left">
              <caption className="sr-only">
                For each example, choose the type of price discrimination and
                whether it poses a consumer welfare concern.
              </caption>
              <colgroup>
                <col className="w-[38%]" />
                <col className="w-[31%]" />
                <col className="w-[31%]" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Example
                  </th>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Type of price discrimination
                  </th>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Consumer welfare concern
                  </th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((item) => (
                  <tr key={item.id}>
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left align-top text-sm font-semibold text-white"
                    >
                      {item.example}
                    </th>
                    {renderSelect(item, "type", TYPE_OPTIONS, "type of price discrimination")}
                    {renderSelect(item, "concern", CONCERN_OPTIONS, "consumer welfare concern")}
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
            {answeredCount} of {TOTAL} answered
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
                You matched {correctCount} of {TOTAL} answers to the suggested
                answer. Where a choice is not the suggested answer, the suggested
                answer is shown beside it.
              </p>
              <p>
                Varying the price according to day of the week or the time of day
                — peak or off peak — is common practice in many industries. It is
                a form of versioning as the hairdresser does not need to identify
                anything about the consumer. Consumers reveal their willingness to
                pay, and sensitivity to price, through their choice of when to
                attend. This is unlikely to be a welfare concern and in many cases
                can be welfare improving if consumers who would not be otherwise
                served at a single price are now served at the off-peak price.
              </p>
              <p>
                Where the price varies by what someone buys alongside the product,
                tying or bundled, then we have versioning. The firm does not have
                to identify who the consumer is, or what group they belong to, but
                gets them to reveal their willingness to pay for separate or
                combined products through their choices. If consumers understand
                what they are buying and the total cost of different options, then
                this form of price discrimination would not be a welfare concern
                in itself. However, if the different pricing options, linked to
                the bundling of phone price and data packages, is complicated
                there may be a consumer welfare concern that consumers are not
                able to identify the best package for themselves.
              </p>
              <p>
                Where the price varies by the nature of the retail outlet (for
                example on a high street or in a hospital) it is capturing
                different willingness to pay and elasticities of different groups
                of consumers. The group is identified based on where they are.
                This could be a welfare concern if the consumer has no choice
                about their location (for example a hospital visit) and there is a
                concern that they are being exploited by the lack of choice
                available (so inelastic demand is enforced rather than being their
                choice). In 2017, a UK retailer was required to change its prices
                because of a welfare concern along these lines. You can read about
                it in the report{" "}
                {ARTICLE_URL ? (
                  <a
                    href={ARTICLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-700 underline hover:text-violet-800"
                  >
                    WH Smith to cut hospital shop prices
                  </a>
                ) : (
                  <span className="font-medium">&apos;WH Smith to cut hospital shop prices&apos;</span>
                )}
                .
              </p>
              <p>
                Haggling or bartering is a form of first degree discrimination
                where customers reveal their willingness to pay and the firm
                charges each consumer their willingness to pay. This will happen
                if bartering is efficient and information is revealed honestly. In
                this case there is a consumer welfare concern as all the surplus
                from the transaction goes to the firm. The only upside is that
                some consumers who might not have been served before may now be
                served.
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

export default PriceDiscriminationTypes;
