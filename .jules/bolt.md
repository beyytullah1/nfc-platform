## 2026-01-17 - PostgreSQL Foreign Key Indexes
**Learning:** Prisma does not automatically generate indexes for foreign keys in PostgreSQL. This is different from MySQL where they are often automatically created.
**Action:** Always manually add `@@index([foreignKey])` for relations in `schema.prisma` when using PostgreSQL to prevent full table scans and performance bottlenecks on relation queries.
