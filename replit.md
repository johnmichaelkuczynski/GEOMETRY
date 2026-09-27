# Geometry — A Four-Week Course

Free, self-paced Geometry course with 29 lessons, practice, an interactive tutor, two homeworks, an 8-question midterm, and a 10-question final. Learners need no account; progress is separated by an anonymous browser identifier.

## Curriculum

- **Week 1:** Foundations, reasoning, and proof
- **Week 2:** Triangles, congruence, and quadrilaterals
- **Week 3:** Similarity, right triangles, and circles
- **Week 4:** Area, volume, and beyond Euclid

Course content and fixed assessments live in `artifacts/api-server/src/lib/geometryCourse.ts`. The owner chose to reset Algebra-specific progress for a fresh Geometry course; the API seed reconciles course content at startup.

## Project notes

- Student app: `artifacts/qr-course` (React + Vite); API: `artifacts/api-server` (Express + PostgreSQL/Drizzle).
- Shared contracts: update `lib/api-spec/openapi.yaml` and run `pnpm --filter @workspace/api-spec run codegen`; do not hand-edit generated API client or validator files.
- Database schema: `lib/db/src/schema/`. Root checks/build: `pnpm run typecheck` and `pnpm run build`.