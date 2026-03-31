class CreateConversationsAndMessages < ActiveRecord::Migration[8.1]
  def change
    # ── Conversations table ──
    create_table "conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.uuid "user1_id", null: false
      t.uuid "user2_id", null: false
      t.timestamps
    end

    add_index "conversations", ["user1_id", "user2_id"], name: "index_conversations_on_user1_id_and_user2_id", unique: true
    add_index "conversations", ["user2_id", "user1_id"], name: "index_conversations_on_user2_id_and_user1_id"

    # ── Messages table ──
    create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.uuid "conversation_id", null: false
      t.uuid "sender_id", null: false
      t.text "body", null: false
      t.datetime "read_at"
      t.timestamps
    end

    add_index "messages", ["conversation_id"], name: "index_messages_on_conversation_id"
    add_index "messages", ["sender_id"], name: "index_messages_on_sender_id"
    add_index "messages", ["read_at"], name: "index_messages_on_read_at"

    # ── Foreign keys (matching your existing schema style) ──
    add_foreign_key "conversations", "users", column: "user1_id"
    add_foreign_key "conversations", "users", column: "user2_id"
    add_foreign_key "messages", "conversations", column: "conversation_id"
    add_foreign_key "messages", "users", column: "sender_id"
  end
end