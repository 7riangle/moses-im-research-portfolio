# Moses Im — Research Portfolio v21

Includes the original waveform landing, geometric ㅇㅁㅅ-inspired brand, research entries, three existing project demos, photo, CV, and the updated Contact icon links and visitor map. The About Me paragraph now uses the approved conversational English text.

## What changed in v21

- `Research experiences.` plural header.
- Intro interests are now exactly `Phonetics · Speech · Computation`.
- Contact includes labelled minimal line-icon links to GitHub, LinkedIn, ORCID, and CV PDF. Email is a separate text link.
- `Around the world.` has a matching map, live dots, and a single country-count sentence (no stats card).
- Visitor function stores **one entry per country**, not per visit or person, using Netlify Functions and site-wide Netlify Blobs. No IP or GPS data are stored by application code. The country is derived server-side by Netlify from the request; Netlify may still maintain normal server access logs.
- The site no longer claims any sample visits, and reports when live tracking is not active.

## Essential: live visitor map deployment

**Drag-and-drop Netlify Drop deploys static files ONLY and do not run a build or deploy the source Netlify Function.** So after a drag-and-drop update the website works but the map is only decorative. To ACTIVATE automatic country recording, connect the EXISTING Netlify site (moses-im.netlify.app) to a GitHub repository or use Netlify CLI.

### Option A — GitHub (recommended)

1. Extract ZIP, then add original SVLR WAV files to `projects/svlr-perception/demo/audio/` (see README in that folder).
2. Create a GitHub repository for this website and upload the contents of this folder, including `netlify/`, `netlify.toml`, and `package.json`. (Exclude `node_modules`.)
3. In Netlify, open your existing `moses-im` project, go to **Project configuration > Developer settings > Continuous deployment > Repository**, then **Link repository**. Choose the new repository. Do NOT create a second Netlify project if you want to keep moses-im.netlify.app.
4. In Netlify build settings, use the repository root as base directory, the publish directory `.` and a build command of `echo Static website with Netlify Functions` (already in netlify.toml). Set Node 22+ when needed. The dependency `@netlify/blobs` is installed from `package.json`.
5. Deploy. Visit `https://moses-im.netlify.app/.netlify/functions/visit-countries` in a browser. It should respond with JSON such as `{ "countries": [] }`. Visit the home page to register the approximate country and refresh for a dot. No backfill of visits before activation.
6. For future updates, edit and push the repository; Netlify builds and deploys it automatically. The site URL stays the same.

### Option B — CLI if you want to keep deploying without Git

1. On your Mac, install Node 22+ and run `npm install` in this folder.
2. Install and authenticate Netlify CLI: `npm install -g netlify-cli` then `netlify login`.
3. Within this folder run `netlify link` and select the EXISTING moses-im site.
4. Deploy to that site with `netlify deploy --prod --dir=. --functions=netlify/functions`.
5. Repeat the command after future changes. The project URL stays the same.

## Current limitation

Netlify Functions and persistence cannot be fully tested inside the offline artifact runtime, so verify against the actual Netlify deploy. The map intentionally shows no invented visits while offline / before functions activation. Dots represent approximate country centroids, not actual visitor addresses. VPNs and automated/bot requests may affect the data; the country count is **not** a count of unique people.

## Original audio needed

The ZIP does not include the 9 original SVLR WAV files. Add them before publishing at `projects/svlr-perception/demo/audio/`, preserving filenames. JS experiment flow / screening thresholds are not modified in this version.

## References

https://docs.netlify.com/build/functions/get-started/
https://docs.netlify.com/build/functions/api/
https://docs.netlify.com/build/data-and-storage/netlify-blobs/
https://docs.netlify.com/build/git-workflows/repo-permissions-linking/
