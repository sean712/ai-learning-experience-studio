// Root layout shared by every route. It is deliberately minimal: it adds no
// site-wide navigation or chrome, so each exercise renders full-bleed and looks
// right when embedded on its own in a Canvas iframe. The home page provides its
// own header and menu.
import "./globals.css";
import IframeAutoHeight from "./iframe-auto-height";
import ScrollToResult from "./scroll-to-result";

// Default metadata. Individual exercise routes override the title through their
// own `metadata` export so browser tabs and assistive technology announce the
// specific exercise.
export const metadata = {
  title: {
    default: "AI learning experience studio",
    template: "%s | AI learning experience studio",
  },
  description:
    "Interactive learning exercises, each available at its own address for embedding in a Canvas course.",
};

export default function RootLayout({ children }) {
  // lang is set to en-GB so screen readers use British English pronunciation.
  return (
    <html lang="en-GB" className="h-full">
      <body className="h-full">
        {children}
        {/* Reports content height to the parent so a Canvas embed can size the
            iframe to fit (see README). Rendered last so it does not become the
            body's first element, which the reporter measures. */}
        <IframeAutoHeight />
        {/* Scrolls a revealed feedback/confirmation/solution panel into view, so
            the result is not left below the fold in a fixed-height iframe. */}
        <ScrollToResult />
      </body>
    </html>
  );
}
