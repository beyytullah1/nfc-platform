## 2025-01-25 - Missing Foreign Key Indexes
**Learning:** Prisma with PostgreSQL does NOT automatically create indexes on foreign key columns. This leads to sequential scans for simple reverse lookups (e.g., finding all blocks for a page).
**Action:** Always manually add `@@index([foreignKeyId])` to relations in `schema.prisma` unless there's a unique constraint already covering it as the primary lookup.
