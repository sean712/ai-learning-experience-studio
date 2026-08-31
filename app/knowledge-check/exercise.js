"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// The questions for the knowledge check. Kept inline so the exercise is fully
// self-contained. `correctIndex` points at the correct entry in `options`, and
// `explanation` is shown as feedback once an answer is checked.
const questions = [
  {
    id: "deep-blue",
    question:
      "In which year did IBM's Deep Blue defeat world chess champion Garry Kasparov?",
    options: ["1986", "1997", "2006", "2011"],
    correctIndex: 1,
    explanation:
      "Deep Blue beat Kasparov in 1997, showing that a machine could out-play a world champion at a highly strategic game.",
  },
  {
    id: "dartmouth",
    question:
      "Which 1956 event is widely credited with founding artificial intelligence as an academic field?",
    options: [
      "The Turing test",
      "The Dartmouth workshop",
      "The launch of ELIZA",
      "The rise of expert systems",
    ],
    correctIndex: 1,
    explanation:
      "The Dartmouth Summer Research Project brought together figures such as John McCarthy and Marvin Minsky and formalised AI as a field of study.",
  },
  {
    id: "eliza",
    question:
      "What was ELIZA, the program Joseph Weizenbaum developed in the 1960s?",
    options: [
      "An early natural language conversation program",
      "A chess-playing computer",
      "A neural network training algorithm",
      "An expert system for medicine",
    ],
    correctIndex: 0,
    explanation:
      "ELIZA simulated conversation using simple pattern matching, marking an early step in human-computer interaction.",
  },
  {
    id: "transformers",
    question:
      "The 2017 introduction of which model architecture underpins today's large language models?",
    options: [
      "Backpropagation",
      "Expert systems",
      "Transformers",
      "Deep Blue",
    ],
    correctIndex: 2,
    explanation:
      "Transformers made it possible to handle text more efficiently and accurately, forming the basis for contemporary language models.",
  },
];

const KnowledgeCheck = () => {
  // Index of the question currently on screen.
  const [currentIndex, setCurrentIndex] = useState(0);
  // The option the user has selected for the current question (or null).
  const [selectedOption, setSelectedOption] = useState(null);
  // Whether the current answer has been checked (locks the choice and reveals
  // feedback).
  const [isChecked, setIsChecked] = useState(false);
  // Running tally of correct answers.
  const [score, setScore] = useState(0);
  // Whether the whole quiz is finished and the results screen is shown.
  const [isFinished, setIsFinished] = useState(false);

  // Used to move focus to the question heading whenever the question changes,
  // so screen reader and keyboard users are taken to the new content.
  const headingRef = useRef(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isCorrect = selectedOption === currentQuestion.correctIndex;

  // Move focus to the question heading when a new question appears, or to the
  // results heading when the quiz finishes.
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [currentIndex, isFinished]);

  // Record the user's choice (only allowed before the answer is checked).
  const handleSelect = (optionIndex) => {
    if (!isChecked) {
      setSelectedOption(optionIndex);
    }
  };

  // Check the selected answer and update the score.
  const handleCheck = () => {
    if (selectedOption === null || isChecked) return;
    if (selectedOption === currentQuestion.correctIndex) {
      setScore((previous) => previous + 1);
    }
    setIsChecked(true);
  };

  // Advance to the next question, or finish the quiz on the last one.
  const handleNext = () => {
    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((previous) => previous + 1);
    setSelectedOption(null);
    setIsChecked(false);
  };

  // Reset everything back to the start.
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setScore(0);
    setIsFinished(false);
  };

  // Results screen shown once every question has been answered.
  if (isFinished) {
    return (
      <div className="min-h-full bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-bold tracking-tight focus:outline-none sm:text-3xl"
            >
              Your results
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              You answered{" "}
              <span className="font-bold text-indigo-700">{score}</span> out of{" "}
              <span className="font-bold">{totalQuestions}</span> questions
              correctly.
            </p>

            <button
              type="button"
              onClick={handleRestart}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Progress indicator, announced politely to assistive technology. */}
        <p
          className="text-sm font-semibold uppercase tracking-widest text-indigo-700"
          aria-live="polite"
        >
          Question {currentIndex + 1} of {totalQuestions}
        </p>

        {/* Visual progress bar. Hidden from screen readers as the text above
            already conveys progress. */}
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* The question and its options are grouped in a fieldset so the
            question text acts as the group label for the radio choices. */}
        <fieldset className="mt-8">
          <legend className="w-full">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold leading-snug tracking-tight focus:outline-none sm:text-2xl"
            >
              {currentQuestion.question}
            </h1>
          </legend>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedOption === optionIndex;
              const isRightAnswer = optionIndex === currentQuestion.correctIndex;

              // Work out the styling for each option. Before checking, the
              // selected option is highlighted. After checking, the correct
              // option is always marked, and a wrong selected option is marked
              // as incorrect.
              let optionClasses =
                "border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50";
              if (isChecked && isRightAnswer) {
                optionClasses = "border-emerald-600 bg-emerald-50";
              } else if (isChecked && isSelected && !isRightAnswer) {
                optionClasses = "border-rose-600 bg-rose-50";
              } else if (!isChecked && isSelected) {
                optionClasses = "border-indigo-600 bg-indigo-50";
              }

              return (
                <label
                  key={optionIndex}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${optionClasses} ${
                    isChecked ? "cursor-default" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={optionIndex}
                    checked={isSelected}
                    onChange={() => handleSelect(optionIndex)}
                    disabled={isChecked}
                    className="h-5 w-5 flex-none accent-indigo-700"
                  />
                  <span className="text-base font-medium text-slate-900">
                    {option}
                  </span>

                  {/* Icons reinforce the colour-coded feedback so meaning is
                      not conveyed by colour alone. */}
                  {isChecked && isRightAnswer && (
                    <CheckCircle2
                      className="ml-auto h-5 w-5 flex-none text-emerald-700"
                      aria-hidden="true"
                    />
                  )}
                  {isChecked && isSelected && !isRightAnswer && (
                    <XCircle
                      className="ml-auto h-5 w-5 flex-none text-rose-700"
                      aria-hidden="true"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Feedback area. role="status" with aria-live means the feedback is
            announced to screen reader users as soon as it appears. */}
        <div role="status" aria-live="polite" className="mt-6">
          {isChecked && (
            <div
              className={`rounded-lg border-2 p-4 ${
                isCorrect
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-rose-600 bg-rose-50"
              }`}
            >
              <p
                className={`font-bold ${
                  isCorrect ? "text-emerald-800" : "text-rose-800"
                }`}
              >
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Action button: either check the current answer or move on. */}
        <div className="mt-8">
          {!isChecked ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={selectedOption === null}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isLastQuestion ? "See results" : "Next question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCheck;
