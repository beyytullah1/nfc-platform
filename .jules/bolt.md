## 2025-01-26 - Missing Foreign Key Indexes in Prisma
**Learning:** Prisma does not automatically create indexes for foreign keys. This leads to full table scans on `JOIN` operations or when filtering by parent ID (e.g., finding all fields of a card).
**Action:** Always manually add `@@index([foreignKey])` in the schema for any relation that is frequently queried.
