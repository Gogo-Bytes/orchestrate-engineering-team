# Current architecture

The website uses Next.js Pages Router, Storyblok CMS, and locale-specific templates. `src/middleware.ts` owns redirects and removed-page status codes. `src/pages` provides request entrypoints; templates compose pages.

The build may continue despite ESLint or TypeScript errors. A successful build does not prove lint or type correctness. A proposed App Router migration has not been accepted.
