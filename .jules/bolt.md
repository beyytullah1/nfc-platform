## 2025-01-27 - Missing Foreign Key Indexes
**Learning:** Prisma does not automatically index foreign keys. In this `nfc-platform` codebase, many core relationships (Account->User, CardField->Card) lacked indexes, likely causing full table scans.
**Action:** Always check `schema.prisma` for `@@index` on FKs, especially for high-traffic tables like `Session` and `CardField`.
