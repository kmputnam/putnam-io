# Design review plan

Prepared on October 12, 2026. This plan uses the local Astro source and the preferences in `AGENTS.md`. It does not change the site design.

## Recommended direction

Use a compact professional profile as the initial direction. Kyle selected professional profile and contact as the main purpose. The site can support that purpose without frequent articles.

Put a short introduction, selected work, and a contact action on the home page. Keep the existing essays in a secondary Writing section. Give professional peers and people who offer work opportunities a direct path to contact Kyle.

The three alternatives all support the selected purpose. Select the single-page professional card when minimal maintenance is the main goal. Select the portfolio only when there is enough approved evidence for two or three case studies.

## Current design and content

The site has five main pages. These pages are Home, Initiatives, Writing, Direction, and Contact. Three additional pages contain individual essays.

The home page identifies Kyle and gives a short professional statement. Its Overview section contains the same four links as the main navigation. The home page contains no work example or direct email link.

Writing contains three short essays. All three source dates are March 1, 2026. The site hides these dates and uses them to sort the essays.

Initiatives contains four summaries with roles and date ranges from 2019 through 2025. Each summary contains a scope statement and three points. The summaries describe actions but give no named organizations, numeric outcomes, or supporting links.

Direction contains four principles about platforms, data, reliability, and simplification. These subjects also occur in the initiatives and essays. A short Approach section can contain this material and reduce navigation choices.

Contact contains an email link and a LinkedIn link. These direct links require little maintenance. They can also appear near the home page introduction.

The visual system uses a restrained blue and slate palette, thin rules, and text sections. It uses Inter for body text and JetBrains Mono for navigation and labels. The desktop home page uses a background portrait, which disappears on phones.

The browser review finds a desktop hero width of approximately 836 pixels at the examined screen size. The `.main-content > section` selector overrides `.hero { max-width: none; }`. This rule limits the hero width, leaves unused space to its right, and restricts the text column.

Review this width limit in the next design sketches. Compare a wider hero with a shorter text introduction and an explicit contact action. Preserve the current image and theme preferences in both sketches.

Source inspection and browser measurements establish the structure, size, and position of elements. Numerical layout assertions do not establish human readability or visitor understanding. A human review must establish those results at each screen size.

## Rules for the next design

Keep the professional, restrained style recorded in `AGENTS.md`. Keep the current color tokens and automatic light and dark themes. Do not add a manual theme control.

Keep motion subtle and keep images secondary to the text. Keep the home page background portrait hidden at phone sizes. Preserve keyboard navigation, visible focus, and the skip link.

Make the home page useful when no article is added for a year. Use stable sections such as About, Selected Work, and Writing. Do not use labels such as Latest or Recently unless a maintained date supports them.

Keep the existing article addresses. If a page address changes, provide a redirect to its replacement. Preserve the article dates in source, with the current date-free presentation.

Do not add a newsletter, comments, or a publishing schedule during this design change. These features require separate decisions and continued attention. The design must function with the existing amount of content.

## Three alternate directions

### A. Compact professional profile

This direction best fits the current content. Use a narrow text column with thin rules and generous space. Use the existing portrait treatment as a secondary element on larger screens.

The home page order is introduction, selected work, approach, and contact. Show two short work examples with links to the Initiatives page. Put email and LinkedIn near the introduction and at the end of the page.

Use three primary navigation items: Work, About, and Contact. Put Writing in a secondary navigation area at the bottom of the page. The About page can contain the current Direction principles and a short biography.

This direction requires approved biography text and two factual work summaries. It does not require new essays. Review the role, contact details, and work summaries every six months or after a job change.

### B. Single-page professional card

This direction has the smallest content requirement. Use one main page with a short biography, two areas of expertise, and direct contact links. Keep the existing palette and a narrow text column.

Use short section links for About, Work, and Contact. Keep Writing as a separate secondary page. Put a small portrait beside the introduction on larger screens, with the portrait hidden on phones.

Combine the existing Direction principles into one short Approach section. Reduce the initiative summaries to two examples or a link to a retained Work page. Keep email and LinkedIn visible near the introduction.

This direction requires approved biography text and concise professional details. It gives less space to work evidence than the other alternatives. Review it after a role or contact change, with no article quota.

### C. Portfolio of selected work

This direction fits visitors who need evidence of professional results. Put two or three work examples before the longer professional statement. Use an ordered list with clear titles, role labels, and concise outcome statements.

Give each example a short case study with the same structure. State the problem, Kyle's role, the main decision, and the result. Include numeric outcomes only when Kyle approves their accuracy and public use.

Use Work, Approach, and Contact in the primary navigation. Keep Writing secondary and link an essay where it supports a case study. Use a small portrait or no portrait in the first screen.

This direction requires the most initial content work. The current initiative summaries provide subjects for case studies but do not establish their results. Add a case study when there is a useful result to show, with no recurring schedule.

## Decisions before design work

The main purpose is professional profile and contact. The initial audience is professional peers and people who offer work opportunities. Rank these two groups before the first sketch if they require different information.

Approve the professional role, biography, and public work claims. Identify which organizations, results, or project details can appear. Do not infer this information from the existing summaries.

Select one of the three directions. Decide whether Writing remains in the primary navigation. Decide whether Direction becomes Approach within another page.

## Review and implementation sequence

1. Record the selected audience, desired action, and design direction.
2. Make a content list with a decision for each existing page and essay.
3. Identify statements that require approval or updated facts.
4. Prepare two home page sketches with the existing content and palette.
5. Show each sketch at phone and desktop sizes, in both themes.
6. Compare the sketches against the success criteria in this document.
7. Approve one sketch and its navigation before changes to the page templates.
8. Write the E2E scenarios before changes to the design code.
9. Implement the approved design and preserve the existing article addresses.
10. Do the E2E scenarios against the built site through the Cloudflare runtime.
11. Save the browser results, screenshots, route results, and build identity as a review artifact.
12. Do a public smoke test after deployment and save the result with the artifact.

E2E means a test of the built site through a browser. The artifact must identify the source commit, dependency lockfile, target URL, and test command. Another person must be able to do the same test from that source.

The redesign must use the established Cloudflare deployment route. Kyle selected the existing Cloudflare hosting. The repository records Cloudflare Workers Builds with static assets.

The Astro configuration identifies [putnam.io](https://putnam.io/) as the intended canonical domain. The release audit finds old WordPress content at this domain through Flywheel. This domain and the public Cloudflare deployment URL require separate release evidence.

Record the Cloudflare deployment URL in the E2E artifact. Do the public smoke test against that URL. A successful Cloudflare result does not establish that the intended canonical domain serves the Astro site.

## Success criteria

The review and E2E artifact must show these results:

- A new visitor can state who Kyle is, what the site contains, and how to contact him from the home page.
- The main contact action is visible in the first screen at phone and desktop sizes.
- The home page still reads correctly when the newest essay is one year old.
- Each work claim has approved text and a clear role for Kyle.
- Every existing article address opens its article or redirects to the same article.
- Navigation and contact links function with a keyboard and have visible focus.
- Content fits a 320-pixel screen without horizontal page scrolling.
- Content remains readable at 200 percent browser zoom.
- Light and dark themes preserve text contrast and the current palette.
- The background portrait is hidden at phone sizes and does not obstruct text on larger screens.
- Reduced-motion preference removes smooth scrolling.
- Each page, image, icon, and manifest request succeeds through the Cloudflare runtime.
- An unknown address returns the intended 404 page with HTTP status 404.
- The saved artifact contains screenshots for all page types, both themes, and phone and desktop sizes.

Visitor understanding requires a human review. Browser results can establish navigation, layout, and response behavior. Keep these two kinds of evidence separate in the final review.

## Source references

- [`AGENTS.md`](../AGENTS.md) records the visual preferences and hosting policy.
- [`src/data/site.ts`](../src/data/site.ts) defines identity, navigation, and contact information.
- [`src/pages/index.astro`](../src/pages/index.astro) defines the home page structure.
- [`src/pages/direction/index.astro`](../src/pages/direction/index.astro) contains the four platform principles.
- [`src/content/initiatives/`](../src/content/initiatives/) contains the four work summaries.
- [`src/content/writing/`](../src/content/writing/) contains the three essays.
- [`src/styles/global.css`](../src/styles/global.css) defines the palette, typography, layout, and screen-size rules.

