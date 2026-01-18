## 2025-01-27 - Composite Indexes for Ordered Relations
**Learning:** The application frequently fetches relations with specific ordering (e.g. `CardField` by `displayOrder`). Standard foreign key indexes aren't enough; composite indexes `[foreignKey, orderByField]` are needed to avoid sorting in memory.
**Action:** Check all `orderBy` usages in Prisma queries and ensure corresponding composite indexes exist.
