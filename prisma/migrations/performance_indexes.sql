-- Performance Optimization Migration
-- Adding indexes to frequently queried fields

-- User indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");

-- NFC Tag indexes
CREATE INDEX IF NOT EXISTS "nfc_tags_public_code_idx" ON "nfc_tags"("public_code");
CREATE INDEX IF NOT EXISTS "nfc_tags_owner_id_idx" ON "nfc_tags"("owner_id");
CREATE INDEX IF NOT EXISTS "nfc_tags_status_idx" ON "nfc_tags"("status");
CREATE INDEX IF NOT EXISTS "nfc_tags_module_type_idx" ON "nfc_tags"("module_type");
CREATE INDEX IF NOT EXISTS "nfc_tags_created_at_idx" ON "nfc_tags"("created_at");

-- Card indexes
CREATE INDEX IF NOT EXISTS "cards_user_id_idx" ON "cards"("user_id");
CREATE INDEX IF NOT EXISTS "cards_slug_idx" ON "cards"("slug");
CREATE INDEX IF NOT EXISTS "cards_view_count_idx" ON "cards"("view_count");
CREATE INDEX IF NOT EXISTS "cards_created_at_idx" ON "cards"("created_at");
CREATE INDEX IF NOT EXISTS "cards_is_public_idx" ON "cards"("is_public");

-- Connection indexes
CREATE INDEX IF NOT EXISTS "connections_user_id_idx" ON "connections"("user_id");
CREATE INDEX IF NOT EXISTS "connections_friend_id_idx" ON "connections"("friend_id");
CREATE INDEX IF NOT EXISTS "connections_card_id_idx" ON "connections"("card_id");
CREATE INDEX IF NOT EXISTS "connections_created_at_idx" ON "connections"("created_at");

-- Plant indexes
CREATE INDEX IF NOT EXISTS "plants_owner_id_idx" ON "plants"("owner_id");
CREATE INDEX IF NOT EXISTS "plants_tag_id_idx" ON "plants"("tag_id");
CREATE INDEX IF NOT EXISTS "plants_created_at_idx" ON "plants"("created_at");
