# STATE.md — Northwind Park (CodeAlpha Task 2: Social Media Platform)

status: COMPLETE
scaffold_sha: d59a29d
next_slice: none — slices 1-5 done on feat/task-2-social
blocked_on: none
pages_verified: /login, /register, / (guest view + authed feed + empty-feed copy), /explore, /posts/:id (like + comment thread), /u/:username (bio, counts, follow toggle, edit profile), /u/:username/followers, /u/:username/following — all walked in a real browser (agent-browser/Chromium), zero page errors, no horizontal overflow at 375px
api_curl: pass
last_backend_test: pass — 34/34 jest tests across 6 suites (npm test, in-memory MongoDB)
last_frontend_build: pass — vite production build
notes:
- Stack: MERN (MongoDB + Mongoose, Express, React 18 + Vite, Tailwind CSS). No Next.js, no file-upload vendor — image URLs only.
- Commit ladder: d59a29d scaffold (main) → 8fb9828 feat/auth-profiles → 0047ee4 feat/posts-feed → 1aef03d feat/likes-comments → 397aaf3 feat/follow-graph → 994a7c5 feat/polish.
- Runtime gates (real server + seeded DB): explore returns 10 seeded posts; guest POST /api/posts → 401; unknown username → 404; feed = own + followed (excludes riley for alex); like twice keeps count; follow toggle updates counts, duplicate safe; cannot follow self; comment creates; stranger delete → 403; author delete → 200.
- Seed logins (password-user-12): alex@example.com (admin), jordan@example.com, sam@example.com, riley@example.com.
- Family-safe scope kept: no DMs, no dating, no ads/pricing, no stories/reels/notifications.
- Guest home bug (missing PostList import) was caught by the browser walk and fixed in 994a7c5.
