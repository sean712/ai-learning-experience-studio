"use client";

import { useEffect } from "react";

// Reports the exercise's true content height to the parent window (Canvas), so
// the embedding page can size the iframe to fit exactly. A cross-origin iframe
// cannot resize itself, so this only has an effect when the parent page runs a
// small listener (see the README for the snippet). When it is not embedded, or
// the parent has no listener, this is a harmless no-op.
//
// We measure the inner content wrapper rather than the document, because each
// exercise's root uses `min-h-full` to fill the frame — that fill would
// otherwise report the frame's current height instead of the natural content
// height, and the frame could never shrink.
export default function IframeAutoHeight() {
  useEffect(() => {
    // Only meaningful inside an iframe.
    if (typeof window === "undefined" || window.parent === window) return;

    // Every page's root uses the `min-h-full` class to fill the frame; its first
    // child is the natural-height content wrapper we want to measure. Finding the
    // root by class is robust against nodes the framework injects into the body.
    const getContentElement = () => {
      const root = document.querySelector(".min-h-full");
      return (root && root.firstElementChild) || root || document.body;
    };

    let frame = 0;
    const postHeight = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = getContentElement();
        const height = Math.ceil(
          element
            ? element.getBoundingClientRect().height
            : document.documentElement.scrollHeight
        );
        if (height > 0) {
          window.parent.postMessage({ type: "ai-studio:resize", height }, "*");
        }
      });
    };

    postHeight();

    // Re-report whenever the content changes size (for example when feedback
    // appears after submitting).
    const observer = new ResizeObserver(postHeight);
    const element = getContentElement();
    if (element) observer.observe(element);
    observer.observe(document.body);
    window.addEventListener("load", postHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", postHeight);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
