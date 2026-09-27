"use client";

import React, { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// A reflective matrix poll. Having imagined a large lottery win, the student
// says whether their demand for each product would go down, stay the same or go
// up. There is no right answer: it depends on their own preferences. On
// submitting we show the feedback, which explains normal, inferior and luxury
// goods. Choices are saved to localStorage so the poll survives a refresh of
// the Canvas iframe.
// ---------------------------------------------------------------------------
const COLUMNS = [
  { key: "down", label: "Down" },
  { key: "no-change", label: "No change" },
  { key: "up", label: "Up" },
];

const PRODUCTS = [
  { id: "alcohol", label: "Alcohol" },
  { id: "housing", label: "Housing cost (rent or cost of purchase)" },
  { id: "commuting", label: "Cost of commuting to university" },
  { id: "weekly-shopping", label: "Weekly shopping" },
  { id: "luxury-holidays", label: "Luxury holidays" },
];

const COLUMN_KEYS = COLUMNS.map((c) => c.key);
const STORAGE_KEY = "bpes-income-and-demand:v1";

const IncomeAndDemand = () => {
  // Map of product id to the chosen column key (or undefined if not answered).
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
        for (const product of PRODUCTS) {
          if (COLUMN_KEYS.includes(saved[product.id])) next[product.id] = saved[product.id];
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

  const answeredCount = PRODUCTS.filter((p) => responses[p.id]).length;
  const allAnswered = answeredCount === PRODUCTS.length;

  // Record a choice. Changing an answer clears the feedback so the student can
  // resubmit once they are happy with their choices.
  const handleSelect = (productId, columnKey) => {
    setResponses((prev) => ({ ...prev, [productId]: columnKey }));
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
            Income and demand
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>You have won £1 million in the lottery.</p>
            <p className="font-semibold text-slate-900">
              For each product, indicate whether you think your demand would go
              down, stay the same or go up because of this income change.
            </p>
            <p className="text-slate-600">
              This is a poll, so there are no right or wrong answers – it depends on
              your own preferences. Feedback appears when you submit.
            </p>
          </div>
        </header>

        {/* The poll. Each row is a radio group; only one choice can be picked per
            product. Scrolls horizontally on very narrow screens. */}
        <section aria-label="Income and demand poll" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">
                For each product, choose whether your demand would go down, stay the
                same or go up.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-4 text-sm font-semibold text-white">
                    Product
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
                {PRODUCTS.map((product) => (
                  <tr key={product.id}>
                    {/* Row header doubles as the group label for its radios. */}
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-4 text-left text-sm font-semibold text-white"
                    >
                      {product.label}
                    </th>
                    {COLUMNS.map((column) => {
                      const isChosen = responses[product.id] === column.key;
                      return (
                        <td
                          key={column.key}
                          className={`border border-slate-200 p-0 text-center ${
                            isChosen ? "bg-violet-50" : "bg-white"
                          }`}
                        >
                          {/* The whole cell is a clickable label around the radio.
                              The aria-label names the product and the choice. */}
                          <label className="flex cursor-pointer items-center justify-center p-4">
                            <input
                              type="radio"
                              name={product.id}
                              value={column.key}
                              checked={isChosen}
                              onChange={() => handleSelect(product.id, column.key)}
                              aria-label={`${product.label}: demand goes ${column.label}`}
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
            {answeredCount} of {PRODUCTS.length} answered
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
                What happens to your demand for different products depends on your
                preference for the goods. If the goods you consume are what we call
                &apos;normal goods&apos;, an increase in income is expected to
                increase how much is consumed. Of course, if you win the lottery you
                can choose to increase some things by a little (for example weekly
                shopping) and others by a lot (for example moving to a more expensive
                house). Your preference for alcohol will also influence what share of
                the extra income you would choose to spend on alcohol – if you started
                out as teetotal then the extra income may not change that. There are
                also some goods, like the cost of commuting to university, that would
                not change very much with income, assuming you kept going to university
                and went by the same mode of transport (of course you could get a
                private car to take you). The price of the train journey does not
                change with your income level. The sharing out of the extra income
                between goods will depend on your preferences across goods.
              </p>
              <p>
                If you consume a good that we call an &apos;inferior good&apos;, an
                increase in income is expected to decrease how much is consumed. These
                are goods that are only consumed because they are all someone can
                afford – that is, they do not have a preference for them and consume
                them purely out of necessity when faced by a tight budget constraint.
                When they get more income they stop consuming them, or significantly
                reduce their consumption of them. An example you might consider is
                someone who buys clothes from the pound store because that is all they
                can afford, but when they have more money they switch to buying from
                the High Street. Essentially, an inferior good is one that someone buys
                knowing it is lower quality (from their perspective) but the best they
                can afford, and that they would stop buying if they had more money.
                This can be different depending on socio-economic status: for some,
                buying from the High Street may be inferior to buying from high-end
                fashion designers.
              </p>
              <p>
                We also refer to some goods as &apos;luxury goods&apos; in economics.
                These are goods where consumption increases more than proportionately
                to the increase in income. Think of something like a sports car or a
                luxury holiday. If your income rises by enough to make it affordable,
                and this is something you have a strong preference for, you may switch
                away from other (normal) goods to buy it. The luxury good becomes a
                higher proportion of your total expenditure, relative to what we call
                necessity goods (which are normal goods).
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

export default IncomeAndDemand;
