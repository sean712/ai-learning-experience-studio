"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// A single-select matrix with a correct answer for each row. For each policy
// the student chooses the level of change they would expect. On submitting, the
// expected answer for each row is shown with a green tick and a wrong choice is
// shown with a red cross, and the feedback explains the behavioural-insights
// evidence.
//
// If you have the URL of the trial results, set RESULTS_URL below and the word
// 'here' in the feedback becomes a link to it (opening in a new tab).
// ---------------------------------------------------------------------------
const RESULTS_URL = "";

const COLUMNS = [
  { key: "no-change", label: "No change in household actions" },
  { key: "small", label: "Small positive change in household actions" },
  { key: "reasonable", label: "Reasonable amount of positive change in household decisions" },
];

// Each policy has one correct column (from the activity's answer key).
const POLICIES = [
  {
    id: "webpages",
    label: "Enhancing webpages that provide information on preparing for flooding",
    correct: "no-change",
  },
  {
    id: "social-media",
    label: "Using social media to explain value to others of protecting your home against flooding",
    correct: "small",
  },
  {
    id: "flood-plans",
    label: "Providing improved information on personal flood plans, including facility to visualise 'future self' in flood situation",
    correct: "reasonable",
  },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "bpes-nudging-flood-protection:v1";

const NudgingFloodProtection = () => {
  // Map of policy id to the chosen column key (or undefined if not answered).
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
        for (const policy of POLICIES) {
          if (COLUMN_KEYS.includes(saved[policy.id])) next[policy.id] = saved[policy.id];
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

  const answeredCount = POLICIES.filter((p) => responses[p.id]).length;
  const allAnswered = answeredCount === POLICIES.length;
  const correctCount = POLICIES.filter((p) => responses[p.id] === p.correct).length;
  const allCorrect = submitted && correctCount === POLICIES.length;

  // Record a choice. Changing an answer clears the marking so the student can
  // check again once they are happy.
  const handleSelect = (policyId, columnKey) => {
    setResponses((prev) => ({ ...prev, [policyId]: columnKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement(
      `You matched ${correctCount} of ${POLICIES.length} policies to the expected level. Feedback is shown below.`
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
            Nudging flood protection
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p className="font-semibold text-slate-900">
              Which of these policies do you think would make people more likely to
              take action, at their own expense, to protect their own homes from
              flooding?
            </p>
            <p>
              For each policy, choose how much positive change you would expect in
              household action, then check your answers.
            </p>
          </div>
        </header>

        {/* The grid. Each row is a radio group; only one level can be picked per
            policy. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Flood policy grid" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">
                For each policy, choose the level of change you would expect: no
                change, a small positive change, or a reasonable amount of positive
                change.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Policy
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
                {POLICIES.map((policy) => (
                  <tr key={policy.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
                    >
                      {policy.label}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[policy.id] === column.key;
                      const isCorrectCell = column.key === policy.correct;
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
                      if (submitted && isCorrectCell) extra = " This is the expected answer.";
                      else if (submitted && isChosen) extra = " You chose this; it is not the expected answer.";

                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${cellClass}`}
                        >
                          <label className="flex cursor-pointer items-center justify-center gap-2 p-4">
                            <input
                              type="radio"
                              name={policy.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(policy.id, column.key)}
                              aria-label={`${policy.label}: ${column.label}.${extra}`}
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
            {answeredCount} of {POLICIES.length} answered
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
                You matched {correctCount} of {POLICIES.length} policies to the
                expected level. The expected answer for each policy is marked with a
                green tick.
              </p>
              <p>
                The UK Behavioural Insights Team conducted nudge trials (experiments)
                with the Environment Agency and WPI Economics to encourage home
                owners to protect themselves from flooding. You can read about the
                results of these trials{" "}
                {RESULTS_URL ? (
                  <a
                    href={RESULTS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-700 underline hover:text-violet-800"
                  >
                    here
                  </a>
                ) : (
                  "in the Behavioural Insights Team's report"
                )}
                . Allowing people to visualise situations and framing the impact in
                terms of the social good can, in this situation, lead to more action
                than simply informing people about the impact of flooding on a
                webpage.
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

export default NudgingFloodProtection;
