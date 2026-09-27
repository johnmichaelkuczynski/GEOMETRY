# Geometry Course — App Blueprint

Architectural overview of the current four-week Geometry course: what it teaches, how its student app and API fit together, and where course data comes from. For concise project and operating notes, see `replit.md`.

---

## 1. Product summary

The app is a self-paced Geometry course with 29 short lessons across four weeks, interactive practice, an AI tutor, two homeworks, an eight-question midterm, and a ten-question final. A Geometry symbol tab is available in the on-screen math keyboard. Learners can use the course without creating an account; the server assigns each visitor a long-lived anonymous browser identifier to keep their progress separate.

The main artifacts are:

| Workspace | Role |
| --- | --- |
| `@workspace/api-server` (`artifacts/api-server`) | Express API, course initialization, persistence, tutoring, grading, analytics, and diagnostics. |
| `@workspace/qr-course` (`artifacts/qr-course`) | Student-facing React + Vite course app. |

Shared workspace libraries include `lib/api-spec` (OpenAPI contract), `lib/api-zod` (generated validators), `lib/api-client-react` (generated React Query hooks), and `lib/db` (Drizzle schema and database client).

---

## 2. Curriculum

**Source of truth:** `artifacts/api-server/src/lib/geometryCourse.ts`. It defines the ordered lessons, lesson text, fixed assignments, questions, and answer keys. The seed process creates seven lessons per week for Weeks 1–3 and eight for Week 4.

| Week | Theme | Topics |
| --- | --- | --- |
| 1 | Foundations, reasoning, and proof | Points, lines, and planes; segments and distance; angles; reasoning; proofs; parallel lines; constructions. |
| 2 | Triangles, congruence, and quadrilaterals | Triangle angle sum; rigid motions and congruence; congruence criteria; isosceles triangles; triangle centers and inequalities; quadrilaterals. |
| 3 | Similarity, right triangles, and circles | Dilations and similarity; proportions; the Pythagorean theorem; trigonometry; circles, arcs, tangents, and coordinate geometry. |
| 4 | Area, volume, and beyond Euclid | Polygon and circle area; surface area and volume; spheres; symmetry and tilings; non-Euclidean geometry; capstone synthesis. |

Each lesson introduces Geometry concepts and includes an applied example. The fixed assessment set is:

| Assessment | Questions | Timing |
| --- | ---: | --- |
| Homework 1.1 — Distance, midpoints, and angles | 4 | Untimed |
| Homework 1.2 — Reasoning and parallel lines | 4 | Untimed |
| Midterm — Weeks 1 & 2 | 8 | 60 minutes |
| Final Exam — Geometry | 10 | 90 minutes |

The app also provides generated/adaptive practice flows in addition to these four fixed assessments.

---

## 3. Course-data initialization and progress

`artifacts/api-server/src/lib/seed.ts` imports `LESSONS` and `ASSIGNMENTS` from the Geometry source and seeds topics, lectures, assignments, and their problems. Week assignment follows lesson order: indices 0–6 are Week 1, 7–13 Week 2, 14–20 Week 3, and 21–28 Week 4.

On server startup, `seedIfEmpty()` compares the database's topic slugs and assignment titles with the current Geometry curriculum. If they match, it leaves course data and progress alone. If they differ, the transaction clears old course-specific activity, practice, assignments, and topics before seeding the new curriculum. The owner explicitly chose this reset so Algebra-specific progress would not appear as Geometry progress. No account is needed; progress is associated with the anonymous visitor cookie, not a registered user.

Database schema is in `lib/db/src/schema/course.ts`:

- `topics` and `lectures` hold the course sequence and lesson content. Lecture rows support optional medium and long bodies in addition to the seeded body.
- `assignments`, `problems`, `attempts`, and `answers` store fixed coursework and submissions.
- `practice_sessions`, `practice_problems`, and `practice_attempts` support topic/week practice.
- Practice assignments, feedback messages, per-user topic statistics, and activity logs support the app's other learning and progress flows.

The schema uses PostgreSQL through Drizzle. The database package exposes `pnpm --filter @workspace/db run push` for applying schema changes.

---

## 4. Service and API architecture

The server is an Express 5 app mounted at `/api`. Health is available at `GET /api/healthz`. An identification middleware assigns an anonymous visitor ID before the course and progress routes; there is no registration/login requirement.

The API covers:

| Area | Routes and role |
| --- | --- |
| Course | `GET /course/overview`, `/course/weeks/:weekNumber`, `/course/lectures/:lectureId`, `/course/topics`, and `/course/download` serve course content. |
| Assignments | `/assignments` routes list assessments, start and retrieve attempts, save answers, and submit for grading. |
| Practice | `/practice/sessions` routes provide adaptive practice; `/practice-assignments` routes manage practice assignment sessions, answers, submissions, and tutor dialogue. |
| Tutor | `GET /tutor/suggestions/:lectureId` and `POST /tutor/ask` provide lecture starters and Geometry help. |
| Progress | `/analytics/*` and `/profile/*` expose activity, topic progress, reports, and readiness information. |
| Detection | `POST /detection/scan` provides a detection endpoint; assignment submissions also record answer grading and detection results. |
| Diagnostics | `/diagnostics/*` includes system checks, synthetic runs, lecture expansion, content audit, and a progress reset. |

The API contract is maintained in `lib/api-spec/openapi.yaml`; generated code lives in `lib/api-zod` and `lib/api-client-react`. For contract changes, update the spec and regenerate with `pnpm --filter @workspace/api-spec run codegen` rather than editing generated files by hand. The student app uses the generated React Query client for API data.

---

## 5. Learning features

- **Lessons:** Read Geometry lecture content, organized by week and topic.
- **Practice:** Work through generated questions with feedback and difficulty that can adapt to results.
- **Tutor:** Ask course-related questions, optionally with lesson context. The tutor is AI-powered; its route returns a visible fallback if the service is unavailable.
- **Assessments:** Save answers during attempts and submit for grading. The midterm and final are timed.
- **Math keyboard:** `artifacts/qr-course/src/components/MathKeyboard.tsx` offers Numbers, Powers & roots, Geometry, Coordinates, and Formulas tabs. The Geometry tab includes angle, degree, pi, perpendicular, parallel, congruence, triangle, circle, logic, and related symbols.
- **Progress:** Anonymous visitor-scoped assignment attempts, practice activity, topic statistics, and analytics feed the progress views.

Assignment grading uses `artifacts/api-server/src/lib/grading.ts`. Answer detection in `artifacts/api-server/src/lib/detection.ts` combines text-based signals with a keystroke/edit trace; GPTZero is optional, and other scoring paths are used when unavailable. Detection scores are indicators, not proof of authorship.

---

## 6. Student app routes

The Wouter router in `artifacts/qr-course/src/App.tsx` defines:

| Route | Page |
| --- | --- |
| `/` | Landing |
| `/dashboard` | Dashboard and course progress |
| `/weeks/:weekNumber` | Week lessons and assessment links |
| `/lectures/:lectureId` | Lesson content, tutor, and practice |
| `/practice/topic/:topicId` | Topic practice |
| `/assignments` and `/assignments/:id` | Assessment list and runner |
| `/practice-assignments/:id` | Practice assignment runner |
| `/analytics` | Learning analytics |
| `/diagnostics` | Operator diagnostics |

---

## 7. Operating notes

- The API server requires `PORT`; it initializes the course before listening.
- Root scripts include `pnpm run typecheck` and `pnpm run build`. Individual app packages define their own scripts.
- To change Geometry lesson or assessment content, edit `artifacts/api-server/src/lib/geometryCourse.ts`; the startup seed reconciles curriculum identity against the database.
- To change database structure, edit `lib/db/src/schema/` and apply the schema using the database package's push command.
- To change an API contract, edit `lib/api-spec/openapi.yaml` and run its `codegen` script. Keep the generated validators and client aligned with the contract.