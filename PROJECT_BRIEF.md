# MASTER PROMPT — ACM STUDENT CHAPTER WEBSITE
## Premium Cinematic Design · Senior-Level UX · Production-Ready Architecture

Act as a **principal product designer, senior frontend engineer, senior backend architect, and design systems engineer** working together on a high-quality, production-ready website.

Your task is to design and implement a complete website for the **ACM Student Chapter at Dr. D. Y. Patil Institute of Technology, Pimpri, Pune, Maharashtra, India**.

This must not look or feel like a generic college club website, a basic student project, a template, or an AI-generated landing page. It should feel like a thoughtfully art-directed digital experience designed by a senior designer and engineered by an experienced software team.

The finished website should be visually exceptional, technically sound, responsive, accessible, maintainable, and ready for deployment.

---

# 1. MANDATORY CONTEXT FILE — READ BEFORE BUILDING

**Read `ACM_Student_Chapter_Factual_Context.md` before building the website. Treat it as the source of truth for all factual ACM Student Chapter content.**

Do this before writing or modifying website content.

The document defines factual boundaries, approved wording, eligibility, application links, institutional identity, membership qualifications, and information that must not be invented.

If the file is available under a slightly different uploaded filename, locate and read the supplied equivalent. Do not silently skip it.

### Mandatory factual rules

- Preserve the facts, organization names, institutional wording, eligibility criteria, links, and important qualifications documented in the context file.
- Do not invent official ACM approval, chapter registration status, chapter numbers, event history, achievements, awards, speakers, partners, membership statistics, testimonials, office-bearer names, contact details, or social links.
- Distinguish future opportunities and potential activities from events that have actually happened.
- Preserve the stated eligibility of Second Year (SE) and Third Year (TE) students unless an updated policy is explicitly supplied.
- Clearly explain that prior coding experience is not required and that technical as well as non-technical contributions are welcome.
- Preserve the fact that submitting an application does not guarantee membership.
- Keep the supplied Google Form URL functional: https://forms.gle/B3tmtCYvdhUnLeW2A
- Link to ACM's general website at https://www.acm.org/.
- Do not present a custom icon or text-based mark as the official ACM logo.
- If a required fact is missing or needs verification, use a clearly identified placeholder or ask for confirmation rather than guessing.

The context document is the authority for factual content. This prompt is the authority for the intended design and technical direction.

---

# 2. THE PRIMARY VISUAL ASSET — USE THE ATTACHED VIDEO

The attached file, `Final Background.mp4`, is the actual cinematic background intended for the website's hero section.

**Use this exact supplied video as the hero background. Do not replace it with stock footage, an alternative AI-generated video, a static illustration, or a generic gradient.**

First inspect the video and understand its composition, colors, lighting, contrast, atmosphere, and motion.

Preserve its distinctive visual identity throughout the entire website.

### The visual language

The background establishes the website's complete artistic direction:

- Deep midnight blue and teal shadows.
- Warm amber and burnt-orange sunlight.
- Muted olive and earthy landscape tones.
- Soft ivory typography.
- Restrained champagne-gold details.
- Dark cinematic overlays, subtle texture, atmospheric depth, and sophisticated contrast.
- A calm, contemplative, technically curious atmosphere.

Use these initial design tokens as a coherent starting point:

- Midnight: `#101827`
- Deep background: `#090D13`
- Warm ivory: `#F5F1E8`
- Muted gold: `#C6AC6B`
- Secondary text: `#B8B9BA`

Refine these values after examining the actual video, without losing its identity.

**Do not create a different visual language for the sections below the hero.** The complete experience must feel like a seamless extension of the cinematic landscape.

Avoid abruptly switching to bright white sections, generic blue-purple gradients, colorful feature cards, excessive glassmorphism, or unrelated illustrations.

Use tonal variations, layered dark surfaces, carefully controlled borders, subtle highlights, generous whitespace, refined typography, and the original video's color palette to create visual hierarchy.

---

# 3. ART DIRECTION — MAKE IT FEEL EXCEPTIONAL

Take inspiration from the precision and restraint of Apple, the sophisticated developer-oriented design language of Linear and Vercel, and premium independent creative studios.

Use these as quality references, not templates to copy.

The outcome should have a distinctive identity of its own.

### Typography

Use a deliberate typographic system with a sophisticated editorial feel.

- Large, expressive hero typography with carefully controlled line lengths.
- Excellent font pairing between a refined display face and a highly legible interface sans-serif.
- Clear hierarchy between headings, descriptions, labels, navigation, and metadata.
- Thoughtful letter spacing and line height.
- Restrained uppercase labels and small technical annotations where appropriate.
- Responsive typography that scales beautifully across mobile, tablet, and desktop.

Use fonts through a reliable, performance-conscious approach. Provide appropriate fallbacks.

### Layout and composition

Think like a senior product designer who cares about every pixel.

- Create intentional asymmetry where it improves the composition.
- Use a consistent spacing scale, grid system, and alignment.
- Preserve generous breathing room.
- Establish clear visual hierarchy and strong reading flow.
- Make the page feel art-directed instead of assembled from repetitive components.
- Use varied layouts where useful instead of repeating the same three-card pattern in every section.
- Keep the experience elegant, coherent, and purposeful.

### Motion and interactions

Motion should feel restrained, fluid, and expensive.

Use subtle entrance animations, carefully tuned hover transitions, understated navigation effects, and meaningful interactive feedback.

Do not animate everything. Avoid excessive parallax, cursor gimmicks, artificial loading screens, distracting particle effects, unnecessary scroll hijacking, and long animation delays.

Respect `prefers-reduced-motion`.

Every interaction must improve usability, communication, or visual polish.

---

# 4. HERO SECTION — THE SIGNATURE EXPERIENCE

Make the hero the most memorable part of the website.

### Background video implementation

Use `Final Background.mp4` as a full-viewport background video.

Move the asset into an organized location such as:

`public/videos/hero-background.mp4`

Implement:

- Autoplay.
- Muted playback.
- Infinite looping.
- `playsInline`.
- A reliable poster image.
- Responsive `object-fit: cover` behavior.
- A dark cinematic overlay to maintain text readability.
- Graceful fallback behavior if video playback fails or is disabled.

Use the video as an atmospheric foundation, not as content that competes with the foreground.

Keep the overlay adjustable through a centralized design token or CSS custom property.

On mobile and slower connections, prioritize a fast and usable experience. Respect reduced-motion preferences and avoid unnecessarily downloading multiple large assets.

Do not apply visual effects that destroy the original video's grain, amber highlights, or dark teal palette.

### Hero content

Build a beautifully composed hero with:

1. A refined navigation bar containing the chapter identity, key navigation links, and a prominent membership action.
2. A compact institutional/location indicator, using factual information from the context file.
3. A bold, distinctive headline explaining the chapter's spirit of computing, exploration, learning, and community.
4. A concise supporting paragraph grounded in the source document.
5. A primary CTA such as **Explore the Chapter**.
6. A secondary CTA such as **Become a Member**.
7. A subtle scroll indicator or directional detail, if it contributes to the composition.

Write strong, natural copy. Avoid empty marketing jargon, unsupported superlatives, generic AI phrases, and invented claims.

The hero must remain legible against every relevant part of the background video.

Keep the headline and essential actions visible without requiring the user to scroll on common desktop screen sizes.

---

# 5. BUILD A COMPLETE, COHESIVE WEBSITE

Create a full website, not a hero demo or a single decorative landing screen.

Include these sections, with navigation and appropriate interactions.

## A. About ACM and the chapter

Explain what ACM is and distinguish the international Association for Computing Machinery from the local campus student community.

Present the chapter's aims through editorial layouts, strong typography, concise copy, and thoughtful visual hierarchy.

## B. Areas of exploration

Use the seven areas identified in the factual context document:

1. Development & Engineering
2. AI & Machine Learning
3. Cybersecurity & Cloud
4. Research & Innovation
5. Design & Creative Technology
6. Events & Community
7. Communication & Management

Present them as compelling areas to explore rather than falsely implying that every team or activity is already operational.

Give each area an appropriate icon or restrained visual treatment, useful descriptive text, and an interaction where it adds value.

## C. The member journey

Present the aspirational journey:

Explore → Learn → Build → Collaborate → Lead

Make this feel like a thoughtfully designed progression, not a generic five-card feature row.

Do not describe it as a guaranteed curriculum or mandatory program.

## D. Tech and non-tech participation

Make it immediately clear that students can contribute without prior coding experience.

Explain technical opportunities such as development, AI/ML, cybersecurity, cloud, projects, and research, alongside design, events, communication, management, outreach, and operations.

Ensure this message is prominent enough that students with non-technical interests do not assume the chapter is exclusively for programmers.

## E. Events and opportunities

Design a refined events experience with suitable layouts for upcoming activities, workshops, sessions, competitions, and community initiatives.

Never fabricate actual events, dates, registration statuses, speakers, or completed activities.

If verified events are not supplied, build a graceful empty state and a clearly separated area for planned or potential activities.

Make future event management straightforward through structured data or the chosen backend.

## F. Projects and community

Create an elegant area for projects, technical experimentation, collaboration, and student contributions.

Do not invent project names, repositories, results, or case studies.

Support verified content when available and sensible empty states when it is not.

## G. Membership and recruitment

Create an especially polished membership section with:

- Eligibility information.
- What members can explore.
- Technical and non-technical participation.
- A concise application process.
- A prominent membership CTA.
- An accessible FAQ accordion.
- The supplied Google Form link.

Make it explicit that SE and TE students at the institution are eligible according to the supplied context, and that submitting an application does not automatically guarantee membership.

Include this exact, understated note at the **end of the membership section**, in small but readable text:

**Registration fees may be involved\***

Preserve the asterisk. Do not invent a fee amount, payment requirement, refund policy, or payment process.

## H. Chapter team

Design a premium team section that can display verified leadership information.

Do not invent names, roles, photographs, or appointments.

Use clearly identified placeholders where necessary, and make it easy to add or update confirmed information later.

Do not publish unverified committee appointments as formally ratified.

## I. Footer and contact

Create a sophisticated footer consistent with the cinematic design.

Include confirmed institutional information, the ACM general website, relevant navigation, the membership link, and only verified contact and social links.

Never invent an official chapter email, social profile, or chapter-specific URL.

---

# 6. SENIOR-LEVEL FRONTEND ENGINEERING

Choose a maintainable architecture and build a real application rather than a large, unstructured component.

### Preferred stack

- React.
- TypeScript.
- Vite.
- Well-structured, reusable React components.
- CSS Modules or another consistent styling approach that fits the project.
- Accessible semantic HTML.
- A lightweight icon library, where required.

Do not introduce unnecessary libraries simply to appear sophisticated.

### Code organization

Separate concerns into clearly named directories, for example:

- `components/` — reusable UI components.
- `sections/` — page-level sections.
- `layouts/` — shared page layouts.
- `pages/` — route-level pages when multiple routes are appropriate.
- `data/` — structured, source-controlled content where suitable.
- `hooks/` — reusable React hooks.
- `lib/` — shared utilities and client configuration.
- `services/` — API access and domain service functions.
- `types/` — shared TypeScript definitions.
- `styles/` — global styles and design tokens.
- `public/` — static assets, video, poster image, favicon, and approved branding assets.
- `tests/` — meaningful automated tests.

Adapt this structure to the actual application instead of creating unnecessary abstractions.

### Engineering standards

- Use strict TypeScript wherever practical.
- Avoid `any` unless genuinely unavoidable and documented.
- Keep components focused, composable, and readable.
- Keep content separate from layout and presentation.
- Centralize navigation, asset paths, design tokens, and application configuration.
- Use meaningful names and predictable file organization.
- Avoid giant components, monolithic CSS files, duplicated logic, deeply nested conditional rendering, and scattered hard-coded URLs.
- Use explicit types for domain models and API responses.
- Handle loading, empty, error, and success states properly.
- Prevent unnecessary re-renders and oversized client bundles.
- Add error boundaries where appropriate.
- Ensure form validation exists on both client and server where applicable.
- Use environment variables for configuration that differs between environments.
- Do not expose secrets or privileged credentials in frontend code.
- Pin and document dependencies appropriately.

Build the simplest architecture that satisfies the actual requirements. Avoid both underengineering and unnecessary enterprise complexity.

---

# 7. BACKEND ARCHITECTURE — DESIGN IT LIKE AN EXPERIENCED ENGINEERING TEAM

The codebase must have a clear, maintainable backend strategy.

First, identify which capabilities genuinely require a backend. Do not manufacture complexity for a mostly informational website.

If dynamic content management, authentication, administration, or persistent submissions are needed, implement a properly separated backend using a maintainable architecture.

### Hosting constraints

The frontend is intended for GitHub Pages and a custom domain.

**GitHub Pages is static hosting; it does not execute a Node.js server.**

Deploy the frontend to GitHub Pages and host the backend separately using an appropriate service. Document the integration between them clearly.

A managed PostgreSQL service such as Supabase is a reasonable option where it fits the requirements, but evaluate the actual application before committing to a technology.

Do not pretend that a local development server or static mock API is a deployed backend.

### Backend design expectations

If a backend is required:

- Separate API routes, request handlers/controllers, business logic, data-access concerns, schemas, configuration, and shared utilities.
- Use clear domain models, appropriate typing, and consistent API response conventions.
- Validate all incoming input at the server boundary.
- Use structured and useful error handling.
- Keep secrets in server-side environment variables.
- Configure CORS explicitly for the approved frontend origin.
- Implement rate limiting and abuse prevention for public submission endpoints.
- Add suitable security headers and secure defaults.
- Use parameterized database access and appropriate database constraints.
- Avoid exposing private member information or administrative data.
- Add database migrations and seed scripts when applicable.
- Document API endpoints and expected request/response formats.
- Include health checks, structured logs, and useful diagnostics.
- Add tests for important business logic, validation, authorization, and API behavior.
- Provide clear local development and deployment instructions.

### Content management

Design the data model only around requirements that genuinely exist.

Potential entities, if needed, include:

- Events.
- Projects.
- Verified team profiles.
- Site announcements.
- Administrative users.

Use stable identifiers, timestamps where meaningful, relationships where necessary, and explicit validation.

Do not create a database table for every visual component. Do not store static content in a database simply because a backend exists.

### Administrative functionality

If a chapter-management dashboard is appropriate, implement it as a properly protected application rather than an unsecured hidden route.

Support authorized content updates, validation, clear error feedback, and confirmation for destructive actions.

Do not create public administrative credentials, hard-coded passwords, or an unauthenticated CRUD API.

Use established authentication and authorization mechanisms instead of inventing a custom security system.

### Membership applications

The supplied Google Form is the existing application flow and should remain functional.

Unless a verified requirement calls for a separate application system, link to the existing form rather than collecting duplicate personal information in a new database.

Never imply that a locally submitted form guarantees membership.

### Deployment configuration

Include:

- `.env.example` containing placeholders only.
- A database setup and migration guide if a database is used.
- Backend deployment instructions.
- Frontend API configuration.
- GitHub Pages deployment configuration.
- Custom-domain setup guidance.
- A clear distinction between public environment variables and server-side secrets.

No secrets should ever be committed to the repository.

If the backend is unnecessary for the initial release, document the decision and provide an architecture that can be extended cleanly. Do not pretend an unimplemented backend exists.

---

# 8. GITHUB PAGES AND CUSTOM DOMAIN

Prepare the application for reliable deployment through GitHub Pages and subsequent custom-domain configuration.

- Configure the Vite base path correctly for the repository deployment URL.
- Avoid broken absolute asset paths.
- Verify that the background video loads correctly in production.
- Ensure that navigation, internal links, fonts, favicons, poster images, and other assets work after deployment.
- Include a repeatable production build process.
- Set up GitHub Actions deployment if appropriate.
- Keep deployment secrets out of the repository.
- Document how to configure the custom domain and DNS.
- Account for HTTPS and cross-origin API requests if a separate backend is deployed.
- Do not assume a custom domain is already configured.
- If client-side routing is used, make sure refreshes and direct navigation work within the hosting constraints.

Keep large source assets manageable. Use a suitable compressed website video and poster image while preserving the supplied original asset.

Do not claim deployment has succeeded until it has actually been tested.

---

# 9. PERFORMANCE AND ACCESSIBILITY

The site should feel premium because it is fast and usable, not merely because it has visual effects.

### Performance

- Optimize the video for web delivery without noticeably degrading the cinematic aesthetic.
- Lazy-load below-the-fold imagery.
- Use appropriately sized, compressed images.
- Minimize unnecessary JavaScript and dependencies.
- Avoid layout shifts.
- Use suitable font-loading strategies.
- Preserve a static hero poster while the video loads.
- Avoid running expensive animations continuously.
- Test the production build rather than relying exclusively on the development server.

### Accessibility

- Use semantic HTML and accessible landmarks.
- Ensure keyboard navigation works.
- Include visible focus indicators.
- Maintain adequate text contrast over the video and other backgrounds.
- Label form controls correctly.
- Give interactive icons accessible names.
- Implement accessible menus and accordions.
- Respect reduced-motion preferences.
- Ensure that video is muted and does not interfere with assistive technology.
- Support mobile, tablet, laptop, and wide desktop displays.

Aim for strong Core Web Vitals and high Lighthouse scores, without sacrificing necessary accessibility or the core visual experience.

---

# 10. RESPONSIVE DESIGN

Do not simply shrink the desktop layout.

Design and test the experience at representative viewport sizes for:

- Small mobile phones.
- Large mobile phones.
- Tablets.
- Standard laptops.
- Large desktop displays.

The background video must remain composed properly at different screen ratios.

Adjust text placement, section spacing, line lengths, navigation, image crops, overlays, and card arrangements intentionally for each breakpoint.

Ensure the interface works with touch input as well as a mouse.

No horizontal overflow, overlapping typography, inaccessible menus, clipped critical content, or oversized mobile assets.

If the background video's composition makes the hero text difficult to read on mobile, adjust the overlay, layout, or poster treatment rather than allowing readability to suffer.

---

# 11. DESIGN SYSTEM AND IMPLEMENTATION QUALITY

Create a coherent design system that includes:

- Color tokens.
- Typography tokens.
- Spacing and sizing scales.
- Content-width conventions.
- Responsive breakpoints.
- Border and surface styles.
- Shadow and overlay treatments.
- Motion timings and easing.
- Consistent button variants.
- Accessible form elements.
- Reusable layout primitives.

Use these tokens consistently across the entire website.

Build reusable components where they create genuine maintainability without abstracting every simple element.

The site should feel like one cohesive product, not a collection of independently styled sections.

Make all interactions real. Buttons must navigate, forms must validate, accordions must open, and menus must work. Do not leave decorative elements pretending to be functional.

Use real supplied content wherever possible, clearly distinguish placeholders from confirmed information, and ensure all outbound links point to the correct destinations.

---

# 12. TESTING AND QUALITY ASSURANCE

Before declaring the project complete:

1. Read the factual context document and verify all factual page content against it.
2. Inspect the repository structure and existing dependencies before changing anything.
3. Build the complete website, including all required sections.
4. Run the production build and resolve errors.
5. Run linting, type checks, and meaningful automated tests where configured.
6. Test navigation, responsive layouts, menus, accordions, membership CTAs, and external links.
7. Verify video loading, autoplay behavior where supported, looping, poster fallback, and reduced-motion handling.
8. Check that all supplied factual restrictions are respected.
9. Inspect console output and network errors.
10. Verify repository-relative paths and production asset URLs.
11. Confirm that missing facts use placeholders rather than fabricated content.
12. Review the final result for visual consistency, readability, accessibility, and performance.

Do not claim tests passed unless you executed them.

Do not silently leave broken functionality, mock links, dummy buttons, or unfinished sections.

---

# 13. EXPECTED DELIVERABLES

Deliver the working project, not merely a design proposal.

The final result should include:

- A complete, polished, responsive ACM Student Chapter website.
- The attached background video correctly integrated into the hero.
- A consistent visual language inspired by the video's cinematic atmosphere.
- A manageable frontend codebase.
- A well-designed backend and data model if justified by the actual features.
- Functional navigation and membership links.
- Structured content that can be maintained without rewriting presentation code.
- Automated deployment configuration where appropriate.
- Meaningful tests and quality checks.
- `.env.example` if environment configuration is required.
- A useful README describing architecture, commands, testing, configuration, and deployment.
- Clear setup instructions for future contributors.
- A documented distinction between completed functionality and anything requiring external configuration or factual confirmation.

First inspect the supplied files and existing repository. Then establish the architecture, implement the complete experience, verify it, and document how to run and deploy it.

Work in sensible, testable steps. Prefer a finished, coherent, production-ready solution over a flashy but incomplete demo.

**Final quality bar:** The website should look intentionally designed, feel exceptionally polished, load efficiently, communicate the chapter's identity honestly, and be maintainable by future student developers.

The goal is a website that makes people stop scrolling, appreciate the craftsmanship, and immediately understand the value and spirit of the ACM Student Chapter.