"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// A reflective rating poll. The student rates a company on the five SERVQUAL
// dimensions of service quality from 1 (low) to 5 (high). There is no right
// answer: on submitting we simply thank them. Ratings are saved to
// localStorage so the poll survives a refresh of the Canvas iframe.
// ---------------------------------------------------------------------------
const RATINGS = [
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5", label: "5" },
];

const DIMENSIONS = [
  { id: "reliability", label: "Reliability" },
  { id: "empathy", label: "Empathy" },
  { id: "responsiveness", label: "Responsiveness" },
  { id: "assurance", label: "Assurance" },
  { id: "tangibles", label: "Tangibles (static content)" },
];

const RATING_KEYS = RATINGS.map((r) => r.key);
const STORAGE_KEY = "mm6-3-product:v1";

const RatingServiceQuality = () => {
  // Map of dimension id to the chosen rating key (or undefined if not answered).
  const [responses, setResponses] = useState({});
  // Whether the poll has been submitted (shows the thank-you message).
  const [submitted, setSubmitted] = useState(false);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");

  // Load any saved ratings once, after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = {};
        for (const dimension of DIMENSIONS) {
          if (RATING_KEYS.includes(saved[dimension.id])) next[dimension.id] = saved[dimension.id];
        }
        setResponses(next);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty poll.
    }
  }, []);

  // Persist ratings whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    } catch {
      // Ignore storage failures.
    }
  }, [responses]);

  const answeredCount = DIMENSIONS.filter((d) => responses[d.id]).length;
  const allAnswered = answeredCount === DIMENSIONS.length;

  // Record a rating. Changing an answer clears the thank-you so the student can
  // resubmit once they are happy with their ratings.
  const handleSelect = (dimensionId, ratingKey) => {
    setResponses((prev) => ({ ...prev, [dimensionId]: ratingKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement("Thank you. Your ratings have been recorded.");
  };

  const handleReset = () => {
    setResponses({});
    setSubmitted(false);
    setAnnouncement("The poll has been reset. All ratings have been cleared.");
  };

  return (
    // min-h-full (never min-h-screen) so the poll fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Introduction */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Rating service quality
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              The SERVQUAL model highlights the dimensions of excellence for
              companies providing the highest service quality. Think about how your
              company, or any business of your choice, fares on each of them.
            </p>
            <p className="font-semibold text-slate-900">
              Analyse service quality in your chosen company and rate it on all five
              dimensions: reliability, empathy, responsiveness, assurance and
              tangibles.
            </p>
            <p className="text-slate-600">
              Rate each dimension from 1 (low) to 5 (high). This is a reflective
              poll, so there are no right or wrong answers.
            </p>
          </div>
        </header>

        {/* The poll. Each row is a radio group; only one rating can be picked per
            dimension. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Service quality ratings" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <caption className="sr-only">
                For each dimension, choose a rating from 1 (low) to 5 (high).
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Dimension
                  </th>
                  {RATINGS.map((rating) => (
                    <th
                      key={rating.key}
                      scope="col"
                      className="bg-slate-800 p-4 text-center text-base font-semibold text-white"
                    >
                      {rating.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dimension) => (
                  <tr key={dimension.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
                    >
                      {dimension.label}
                    </th>
                    {RATINGS.map((rating) => {
                      const isChosen = responses[dimension.id] === rating.key;
                      return (
                        <td
                          key={rating.key}
                          className={`border border-slate-200 p-0 text-center ${
                            isChosen ? "bg-violet-50" : "bg-white"
                          }`}
                        >
                          {/* The whole cell is a clickable label around the radio.
                              The aria-label gives the radio a full name combining
                              the dimension and the rating. */}
                          <label className="flex cursor-pointer items-center justify-center p-4">
                            <input
                              type="radio"
                              name={dimension.id}
                              value={rating.key}
                              checked={isChosen}
                              onChange={() => handleSelect(dimension.id, rating.key)}
                              aria-label={`${dimension.label}: rating ${rating.label} out of 5`}
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
          <p className="mt-2 text-sm text-slate-500">1 = low, 5 = high</p>
        </section>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Submit ratings
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            Clear
          </button>
          <p className="text-sm text-slate-600" aria-live="polite">
            {answeredCount} of {DIMENSIONS.length} rated
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
              <p>Your ratings have been recorded.</p>
              <p>
                Reflecting on how your company performs across these five dimensions
                is the point of the exercise. Which dimension came out strongest, and
                which might it work on?
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

export default RatingServiceQuality;
