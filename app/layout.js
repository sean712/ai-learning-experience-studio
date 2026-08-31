// Root layout shared by every route. It is deliberately minimal: it adds no
// site-wide navigation or chrome, so each exercise renders full-bleed and looks
// right when embedded on its own in a Canvas iframe. The home page provides its
// own header and menu.
import "./globals.css";

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
      <body className="h-full">{children}</body>
    </html>
  );
}
