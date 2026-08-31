/**
 * Next.js configuration.
 *
 * Each exercise route is designed to be embedded in an <iframe> inside a
 * Canvas course, so we must NOT send headers that block framing (for example
 * X-Frame-Options: DENY). Next.js sends no framing restriction by default, so
 * there is nothing to disable here. The permissive frame-ancestors header
 * below makes that intent explicit and keeps it stable if defaults ever change.
 */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Allow this site's pages to be iframed by any parent (Canvas).
          // Tighten this to your institution's Canvas domain(s) if preferred,
          // e.g. "frame-ancestors 'self' https://canvas.example.ac.uk".
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
