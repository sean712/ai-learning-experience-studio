"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// A reflective poll. For each item the student chooses one of three columns.
// There is no right answer: on submitting we simply thank them and point them
// to the follow-up discussion. Selections are saved to localStorage so the
// poll survives a refresh of the Canvas iframe.
// ---------------------------------------------------------------------------
const COLUMNS = [
  { key: "definitely", label: "Definitely counts as money" },
  { key: "maybe", label: "Maybe counts as money" },
  { key: "probably-not", label: "Probably doesn't count as money" },
];

const ITEMS = [
  { id: "ten-dollar-bill", label: "$10 dollar bill" },
  { id: "one-cent-coin", label: "1 cent coin" },
  { id: "current-account", label: "Bank deposit in a current/checking account" },
  { id: "savings-account", label: "Bank deposit in a savings account" },
  { id: "overdraft", label: "Agreed overdraft facility with a bank" },
  { id: "gold-bar", label: "Gold bar" },
  { id: "microsoft-shares", label: "1000 shares in Microsoft" },
  { id: "credit-card", label: "Credit card" },
  { id: "debit-card", label: "Debit card" },
  { id: "amazon-voucher", label: "$500 Amazon voucher" },
  { id: "bitcoin", label: "Bitcoin" },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "me9-2-what-is-money:v1";

const WhatIsMoney = () => {
  // Map of item id to the chosen column key (or undefined if not yet answered).
  const [responses, setResponses] = useState({});
  // Whether the poll has been submitted (shows the thank-you message).
  const [submitted, setSubmitted] = useState(false);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");

  // Load any saved responses once, after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = {};
        for (const item of ITEMS) {
          if (COLUMN_KEYS.includes(saved[item.id])) next[item.id] = saved[item.id];
        }
        setResponses(next);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty poll.
    }
  }, []);

  // Persist responses whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    } catch {
      // Ignore storage failures.
    }
  }, [responses]);

  const answeredCount = ITEMS.filter((item) => responses[item.id]).length;
  const allAnswered = answeredCount === ITEMS.length;

  // Record a choice. Changing an answer clears the thank-you so the student can
  // resubmit once they are happy with their responses.
  const handleSelect = (itemId, columnKey) => {
    setResponses((prev) => ({ ...prev, [itemId]: columnKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement("Thank you. Your responses have been recorded.");
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
            What is money?
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              Think about what makes something &apos;money&apos; and whether the
              items on the list meet these criteria.
            </p>
            <p className="font-semibold text-slate-900">
              For each item, choose whether it definitely counts as money, maybe
              counts as money or probably doesn&apos;t count as money.
            </p>
            <p className="text-slate-600">
              This is a poll, so there are no right or wrong answers – it is about
              your own judgement.
            </p>
          </div>
        </header>

        {/* The poll. Each row is a radio group; only one choice can be picked per
            item. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Money poll" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">
                For each item, choose one column: definitely counts as money,
                maybe counts as money or probably doesn&apos;t count as money.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Item
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
                {ITEMS.map((item) => (
                  <tr key={item.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
                    >
                      {item.label}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[item.id] === column.key;
                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${
                            isChosen ? "bg-violet-50" : "bg-white"
                          }`}
                        >
                          {/* The whole cell is a clickable label around the radio.
                              The aria-label gives the radio a full name combining
                              the item and the column. */}
                          <label className="flex cursor-pointer items-center justify-center p-4">
                            <input
                              type="radio"
                              name={item.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(item.id, column.key)}
                              aria-label={`${item.label}: ${column.label}`}
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
            {answeredCount} of {ITEMS.length} answered
          </p>
        </div>

        {/* Confirmation shown after submitting. */}
        {submitted && (
          <div
            role="region"
            aria-label="Confirmation"
            className="mt-6 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-5"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-800">
              <CheckCircle2 className="h-5 w-5 flex-none" aria-hidden="true" />
              Thank you
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
              <p>Your responses have been recorded.</p>
              <p>
                Next, discuss the exercise with others and, in particular, give
                your reasons for the answer you gave for Bitcoin.
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

export default WhatIsMoney;
