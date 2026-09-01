"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// A two-question reflective poll. Having seen a set of adverts, the student
// chooses, for each advert, its objective (inform, persuade or remind) and its
// communication task in the AIDA model (attention, interest, desire or action).
// There is no right answer: on submitting we simply thank them. Choices are
// saved to localStorage so the poll survives a refresh of the Canvas iframe.
// ---------------------------------------------------------------------------
const ADVERTS = [
  { id: "advert-a", label: "Advert A" },
  { id: "advert-b", label: "Advert B" },
  { id: "advert-c", label: "Advert C" },
  { id: "advert-d", label: "Advert D" },
  { id: "advert-e", label: "Advert E" },
  { id: "advert-f", label: "Advert F" },
  { id: "advert-g", label: "Advert G" },
  { id: "advert-h", label: "Advert H" },
];

const OBJECTIVE_COLUMNS = [
  { key: "inform", label: "Inform" },
  { key: "persuade", label: "Persuade" },
  { key: "remind", label: "Remind" },
];

const TASK_COLUMNS = [
  { key: "attention", label: "Attention" },
  { key: "interest", label: "Interest" },
  { key: "desire", label: "Desire" },
  { key: "action", label: "Action" },
];

const OBJECTIVE_KEYS = OBJECTIVE_COLUMNS.map((c) => c.key);
const TASK_KEYS = TASK_COLUMNS.map((c) => c.key);
const STORAGE_KEY = "mm8-2-1-communications-objectives:v1";

// A single radio-matrix table. It is controlled: the current choices and the
// change handler are passed in, so it holds no state of its own.
function PollMatrix({ caption, columns, responses, onSelect, namePrefix, rowContext }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
              Advert
            </th>
            {columns.map((column) => (
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
          {ADVERTS.map((advert) => (
            <tr key={advert.id}>
              {/* Row header doubles as the group label for its radios. */}
              <th
                scope="row"
                className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
              >
                {advert.label}
              </th>
              {columns.map((column) => {
                const isChosen = responses[advert.id] === column.key;
                return (
                  <td
                    key={column.key}
                    className={`border border-slate-200 p-0 text-center ${
                      isChosen ? "bg-violet-50" : "bg-white"
                    }`}
                  >
                    {/* The whole cell is a clickable label around the radio. The
                        aria-label names the advert, the question and the choice. */}
                    <label className="flex cursor-pointer items-center justify-center p-4">
                      <input
                        type="radio"
                        name={`${namePrefix}-${advert.id}`}
                        value={column.key}
                        checked={isChosen}
                        onChange={() => onSelect(advert.id, column.key)}
                        aria-label={`${advert.label}, ${rowContext}: ${column.label}`}
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
  );
}

const CommunicationsObjectives = () => {
  // Two maps of advert id to the chosen column key.
  const [objectives, setObjectives] = useState({});
  const [tasks, setTasks] = useState({});
  // Whether the poll has been submitted (shows the thank-you message).
  const [submitted, setSubmitted] = useState(false);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");

  // Load any saved choices once, after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const nextObjectives = {};
        const nextTasks = {};
        for (const advert of ADVERTS) {
          if (OBJECTIVE_KEYS.includes(saved?.objectives?.[advert.id])) {
            nextObjectives[advert.id] = saved.objectives[advert.id];
          }
          if (TASK_KEYS.includes(saved?.tasks?.[advert.id])) {
            nextTasks[advert.id] = saved.tasks[advert.id];
          }
        }
        setObjectives(nextObjectives);
        setTasks(nextTasks);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty poll.
    }
  }, []);

  // Persist choices whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ objectives, tasks }));
    } catch {
      // Ignore storage failures.
    }
  }, [objectives, tasks]);

  const objectivesAnswered = ADVERTS.filter((a) => objectives[a.id]).length;
  const tasksAnswered = ADVERTS.filter((a) => tasks[a.id]).length;
  const answeredCount = objectivesAnswered + tasksAnswered;
  const totalCount = ADVERTS.length * 2;
  const allAnswered = answeredCount === totalCount;

  // Changing an answer clears the thank-you so the student can resubmit once
  // they are happy with their choices.
  const handleObjective = (advertId, key) => {
    setObjectives((prev) => ({ ...prev, [advertId]: key }));
    setSubmitted(false);
  };
  const handleTask = (advertId, key) => {
    setTasks((prev) => ({ ...prev, [advertId]: key }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement("Thank you. Your responses have been recorded.");
  };

  const handleReset = () => {
    setObjectives({});
    setTasks({});
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
            Setting communications objectives
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
            Think about the adverts you have just seen. For each one, choose its
            objective and its communication task. This is a reflective poll, so
            there are no right or wrong answers.
          </p>
        </header>

        {/* Question 1: objective */}
        <section aria-label="Question 1: objective" className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">
            1. What is the objective of each advert?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose the objective of each advert: inform, persuade or remind.
          </p>
          <div className="mt-3">
            <PollMatrix
              caption="For each advert, choose its objective: inform, persuade or remind."
              columns={OBJECTIVE_COLUMNS}
              responses={objectives}
              onSelect={handleObjective}
              namePrefix="objective"
              rowContext="objective"
            />
          </div>
        </section>

        {/* Question 2: communication task */}
        <section aria-label="Question 2: communication task" className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">
            2. What is the communication task of each advert?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose the communication task of each advert: attention, interest,
            desire or action.
          </p>
          <div className="mt-3">
            <PollMatrix
              caption="For each advert, choose its communication task: attention, interest, desire or action."
              columns={TASK_COLUMNS}
              responses={tasks}
              onSelect={handleTask}
              namePrefix="task"
              rowContext="communication task"
            />
          </div>
        </section>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
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
            {answeredCount} of {totalCount} answered
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
            <p className="mt-2 text-sm leading-relaxed text-slate-800 sm:text-base">
              Your responses have been recorded.
            </p>
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

export default CommunicationsObjectives;
