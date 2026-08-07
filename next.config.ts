import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside a worktree under a larger workspace that has its own
  // lockfiles. Without pinning the root, Turbopack walks up and infers one of
  // those instead of this directory.
  turbopack: { root: import.meta.dirname },

  async redirects() {
    return [
      {
        // The whitepaper PDF moved out of public/ and is served by the route
        // handler at app/whitepaper/pdf, so one URL is its only address. The
        // old path is still referenced by app/journey/defs.tsx and by the
        // authored journeys in .quirq/journeys, and a journey someone wrote
        // months ago should not 404 because the file was reorganised.
        // Honouring the old URL is cheaper than rewriting authored content,
        // and it avoids keeping a second copy of a 531 kB file.
        source: "/quirq-whitepaper.pdf",
        destination: "/whitepaper/pdf",
        permanent: true,
      },

      // The research shelves were renamed (foundations, accounting, evidence,
      // experiments) to (speed-trials, from-the-desk, proving-grounds). Each
      // old archive points at the shelf that took most of its notes, so a
      // link into the old taxonomy lands on the notes it was pointing at
      // rather than on a 404. Same reasoning as the PDF above.
      ...(
        [
          ["foundations", "from-the-desk"],
          ["accounting", "from-the-desk"],
          ["evidence", "proving-grounds"],
          ["experiments", "speed-trials"],
        ] as const
      ).map(([from, to]) => ({
        source: `/research/topic/${from}`,
        destination: `/research/topic/${to}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
