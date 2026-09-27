---
name: Course replacement operations
description: Non-obvious cautions when converting this course runtime to another curriculum.
---

## Curriculum scope

A course replacement must update degraded practice paths, AI prompts, downloads, static/prerendered SEO output, artifact metadata, and student-facing copy—not only seeded lessons.

**Why:** Earlier replacements left the old subject visible through fallback problems and prebuilt page metadata even after the main course appeared updated.

**How to apply:** Check the whole student journey, including failure paths and the production build output. Validate artifact metadata through the artifact tooling rather than editing manifests in place. Do not relabel unrelated video artifacts without updating their contents.

## External database setup

This project has used an external PostgreSQL database. A fresh database needs its schema created before the API can seed a course; do not assume a managed database already exists.

**Why:** The seed routine requires tables to exist before it can insert the curriculum.

**How to apply:** Inspect the current database configuration before operations, and apply schema changes through the project's database package if the schema is absent. Never migrate to a different database without explicit approval.