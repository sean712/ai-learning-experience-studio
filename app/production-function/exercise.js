"use client";

import React, { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// A prediction poll for the Cobb-Douglas production function spreadsheet. For
// each change to capital or labour the student predicts whether output (or the
// marginal product of labour or capital) rises, falls or stays the same. This
// is a self-assessment rather than a graded quiz: on submitting we reveal a
// short feedback presentation (a video) that works through the calculations.
// Choices are saved to localStorage so the poll survives a refresh of the
// Canvas iframe.
//
// VIDEO_ID is the Vimeo id of the feedback presentation. If it ever changes,
// update it here.
// ---------------------------------------------------------------------------
const VIDEO_ID = "756802163";

// The three possible answers for every row.
const COLUMNS = [
  { key: "rises", label: "Rises" },
  { key: "falls", label: "Falls" },
  { key: "same", label: "Stays the same" },
];

// The nine changes to try in the spreadsheet, grouped as three scenarios of
// three questions (output, marginal product of labour, marginal product of
// capital).
const QUESTIONS = [
  {
    id: "cap-output",
    text: "Increase the amount of capital from 200 to 400, holding labour at 200. What happens to output?",
  },
  {
    id: "cap-mpl",
    text: "Increase the amount of capital from 200 to 400, holding labour at 200. What happens to the marginal product of labour?",
  },
  {
    id: "cap-mpk",
    text: "Increase the amount of capital from 200 to 400, holding labour at 200. What happens to the marginal product of capital?",
  },
  {
    id: "lab-output",
    text: "Increase the amount of labour from 200 to 300, holding capital at 200. What happens to output?",
  },
  {
    id: "lab-mpl",
    text: "Increase the amount of labour from 200 to 300, holding capital at 200. What happens to the marginal product of labour?",
  },
  {
    id: "lab-mpk",
    text: "Increase the amount of labour from 200 to 300, holding capital at 200. What happens to the marginal product of capital?",
  },
  {
    id: "double-output",
    text: "Set labour to 300 and capital to 400. Now double both inputs. What happens to output?",
  },
  {
    id: "double-mpl",
    text: "Set labour to 300 and capital to 400. Now double both inputs. What happens to the marginal product of labour?",
  },
  {
    id: "double-mpk",
    text: "Set labour to 300 and capital to 400. Now double both inputs. What happens to the marginal product of capital?",
  },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "production-function:v1";

const ProductionFunction = () => {
  // Map of question id to the chosen column key (or undefined if not answered).
  const [responses, setResponses] = useState({});
  // Whether the poll has been submitted (shows the feedback video).
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
        for (const question of QUESTIONS) {
          if (COLUMN_KEYS.includes(saved[question.id])) next[question.id] = saved[question.id];
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

  const answeredCount = QUESTIONS.filter((q) => responses[q.id]).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  // Record a choice. Changing an answer clears the feedback so the student can
  // resubmit once they are happy with their predictions.
  const handleSelect = (questionId, columnKey) => {
    setResponses((prev) => ({ ...prev, [questionId]: columnKey }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement("Thank you. A feedback presentation is shown below.");
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
            Manipulating a production function
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              The spreadsheet in the instructions shows a Cobb-Douglas production
              function graphed against labour and against capital. Make each
              change below in the spreadsheet and see what happens to output and
              to the marginal products of labour and capital.
            </p>
            <p className="font-semibold text-slate-900">
              For each change, choose whether the quantity rises, falls or stays
              the same.
            </p>
            <p className="text-slate-600">
              This is a prediction poll, so record what you find. A feedback
              presentation working through the calculations appears when you
              submit.
            </p>
          </div>
        </header>

        {/* The poll. Each row is a radio group; only one answer can be picked per
            question. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Production function poll" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">
                For each change to the production function, choose whether the
                quantity rises, falls or stays the same.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Change
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
                {QUESTIONS.map((question) => (
                  <tr key={question.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-medium text-white"
                    >
                      {question.text}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[question.id] === column.key;
                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${
                            isChosen ? "bg-violet-50" : "bg-white"
                          }`}
                        >
                          {/* The whole cell is a clickable label around the radio.
                              The aria-label names the change and the choice. */}
                          <label className="flex cursor-pointer items-center justify-center p-4">
                            <input
                              type="radio"
                              name={question.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(question.id, column.key)}
                              aria-label={`${question.text} Answer: ${column.label}`}
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
            {answeredCount} of {QUESTIONS.length} answered
          </p>
        </div>

        {/* Feedback shown after submitting: a short presentation working through
            the calculations. */}
        {submitted && (
          <div
            role="region"
            aria-label="Feedback"
            className="mt-6 rounded-xl border-2 border-slate-300 bg-slate-100 p-5"
          >
            <h2 className="text-lg font-bold text-slate-900">Feedback</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-800 sm:text-base">
              Watch this feedback presentation to see the calculations and a
              discussion of them.
            </p>
            {/* Responsive 16:9 video wrapper (aspect-video keeps the ratio). */}
            <div className="mt-3 aspect-video w-full max-w-[920px] overflow-hidden rounded-lg border border-slate-300 bg-black">
              <iframe
                src={`https://player.vimeo.com/video/${VIDEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479`}
                title="Production function feedback presentation"
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                className="h-full w-full"
              />
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

export default ProductionFunction;
