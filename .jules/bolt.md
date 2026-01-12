## 2024-05-23 - [Prisma Foreign Key Indexes]
**Learning:** The `prisma/schema.prisma` file was missing `@@index` on almost all foreign keys. Prisma does not automatically index FKs, leading to full table scans on relational queries.
**Action:** Always check `schema.prisma` for missing indexes on `relation` fields, especially those used in `where` clauses or joins.
