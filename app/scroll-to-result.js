"use client";

import { useEffect } from "react";

// When an exercise reveals its feedback, confirmation or solution after the
// student submits, bring that panel to the top of the view. Inside a
// fixed-height Canvas iframe this means the result is never left below the fold
// (the alternative to the parent resizing the iframe, which needs Canvas admin
// access we may not have). It scrolls only within this document, so the
// surrounding Canvas page never jumps.
//
// This is global (mounted from the root layout) so every exercise behaves the
// same without each one wiring up its own scrolling.
const RESULT_SELECTOR = [
  '[role="region"][aria-label="Feedback"]',
  '[role="region"][aria-label="Confirmation"]',
  '[role="region"][aria-label="Suggested solution"]',
].join(",");

export default function ScrollToResult() {
  useEffect(() => {
    // Remember any result already on screen at mount so we do not scroll to it
    // on first load (there should be none, but this is defensive).
    let lastSeen = document.querySelector(RESULT_SELECTOR);

    const observer = new MutationObserver(() => {
      const result = document.querySelector(RESULT_SELECTOR);
      if (result && result !== lastSeen) {
        // A result panel has just appeared: reveal it.
        lastSeen = result;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (!result) {
        // It was removed (for example the student changed an answer), so the
        // next appearance should scroll again.
        lastSeen = null;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
