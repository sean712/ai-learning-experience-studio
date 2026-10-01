"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// A single-select matrix with a correct answer for each row. For each societal
// issue the student decides whether it is primarily a market failure, a
// competition concern or an equity concern. On checking, the primary concern
// for each row is shown with a green tick and a wrong choice with a red cross,
// and the feedback discusses each example.
// ---------------------------------------------------------------------------

// The three types of concern, in the order shown in the original activity.
const COLUMNS = [
  { key: "market-failure", label: "Market failure" },
  { key: "competition", label: "Competition concern" },
  { key: "equity", label: "Equity concern" },
];

// Each issue has one primary concern (from the activity's answer key).
const ISSUES = [
  {
    id: "social-media",
    label: "A social media site allows advertisers access to data on what consumers are doing on their devices",
    // Consumers lack full information about how their data is used.
    correct: "market-failure",
  },
  {
    id: "beach-litter",
    label: "Visitors to a beach leave litter at the end of the day",
    // A negative externality on others who use the beach later.
    correct: "market-failure",
  },
  {
    id: "universities",
    label: "The best universities in a country provide more places to people who have attended fee-paying schools",
    // The main focus of concern is the distributional effect.
    correct: "equity",
  },
  {
    id: "electricity",
    label: "An electricity generation plant agrees to only sell its electricity to one energy supply company in the country",
    // Foreclosing rivals from a necessary input (market power).
    correct: "competition",
  },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "types-of-concern:v1";

const TypesOfConcern = () => {
  // Map of issue id to the chosen column key (or undefined if not answered).
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
        for (const issue of ISSUES) {
          if (COLUMN_KEYS.includes(saved[issue.id])) next[issue.id] = saved[issue.id];
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

  const answeredCount = ISSUES.filter((i) => responses[i.id]).length;
  const allAnswered = answeredCount === ISSUES.length;
  const correctCount = ISSUES.filter((i) => responses[i.id] === i.correct).length;
  const allCorrect = submitted && correctCount === ISSUES.length;

  // Record a choice. Changing an answer clears the marking so the student can
  // check again once they are happy.
  const handleSelect = (issueId, columnKey) => {
    setResponses((prev) => ({ ...prev, [issueId]: columnKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement(
      `You matched ${correctCount} of ${ISSUES.length} issues to the primary concern. Feedback is shown below.`
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
            Market failure, competition or equity?
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              For each societal issue, decide whether it is primarily a market
              failure, a competition concern or an equity concern. You might think
              some are more than one type of concern, but pick the one that you
              think is the primary issue, then check your answers.
            </p>
          </div>
        </header>

        {/* The grid. Each row is a radio group; only one concern can be picked per
            issue. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Types of concern grid" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">
                For each issue, choose whether it is primarily a market failure, a
                competition concern or an equity concern.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Issue
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="bg-slate-800 p-4 text-center text-sm font-semibold text-white"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ISSUES.map((issue) => (
                  <tr key={issue.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-medium text-white"
                    >
                      {issue.label}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[issue.id] === column.key;
                      const isCorrectCell = column.key === issue.correct;
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
                      if (submitted && isCorrectCell) extra = " This is the primary concern.";
                      else if (submitted && isChosen) extra = " You chose this; it is not the primary concern.";

                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${cellClass}`}
                        >
                          <label className="flex cursor-pointer items-center justify-center gap-2 p-4">
                            <input
                              type="radio"
                              name={issue.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(issue.id, column.key)}
                              aria-label={`${issue.label}: ${column.label}.${extra}`}
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
            {answeredCount} of {ISSUES.length} answered
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
                You matched {correctCount} of {ISSUES.length} issues to the primary
                concern. The primary concern for each issue is marked with a green
                tick.
              </p>
              <p>
                It can be hard to look at a situation and know whether resources
                are being allocated efficiently and fairly, and where they are not
                to understand what the main cause of concern is. As economists we
                need to look at the situation to identify the concern before we can
                start to analyse potential solutions.
              </p>
              <p>Looking at our four examples:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  The social media site giving access to data to advertisers is
                  most likely a concern about consumers not having full information
                  about how their data is being used. It is a consumer harm concern
                  linked to an information market failure.
                </li>
                <li>
                  Litter affects all the people who use the beach over time and the
                  wildlife in the water and on the beach. It is not the people who
                  have already left who are affected. This is a market failure
                  created by people making decisions without considering the impact
                  on others.
                </li>
                <li>
                  The situation of a university offering more places to people who
                  are better off than others raises equity concerns. Of course, the
                  underlying issues may also stem from market failures or
                  competition issues but the main focus of concern would be the
                  distributional effects.
                </li>
                <li>
                  The electricity generation plant is preventing other supply
                  companies from having access to a necessary input to their
                  service. If they cannot access the electricity they cannot offer
                  supply services to customers. This will be a competition concern
                  if the electricity generation plant has market power such that the
                  excluded supply companies have limited other sources of the
                  necessary input.
                </li>
              </ul>
              <p>
                You will learn more about market failures in the rest of this
                session.
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

export default TypesOfConcern;
