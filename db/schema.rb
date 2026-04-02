# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_01_191531) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.uuid "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "applications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "applicant_id", null: false
    t.datetime "created_at", null: false
    t.datetime "creation_time", null: false
    t.integer "desired_rental_duration"
    t.text "details"
    t.boolean "has_pets", default: false
    t.string "marital_status"
    t.uuid "place_id", null: false
    t.string "reference_phone"
    t.integer "status", default: -1, null: false
    t.datetime "updated_at", null: false
    t.index ["applicant_id"], name: "index_applications_on_applicant_id"
    t.index ["place_id", "applicant_id"], name: "index_applications_on_place_id_and_applicant_id", unique: true
    t.index ["place_id"], name: "index_applications_on_place_id"
  end

  create_table "conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user1_id", null: false
    t.uuid "user2_id", null: false
    t.index ["user1_id", "user2_id"], name: "index_conversations_on_user1_id_and_user2_id", unique: true
    t.index ["user2_id", "user1_id"], name: "index_conversations_on_user2_id_and_user1_id"
  end

  create_table "favorites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "place_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["place_id"], name: "index_favorites_on_place_id"
    t.index ["user_id", "place_id"], name: "index_favorites_on_user_id_and_place_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "body", null: false
    t.uuid "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "read_at"
    t.uuid "sender_id", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["read_at"], name: "index_messages_on_read_at"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "place_pictures", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "pic_order", default: 0, null: false
    t.uuid "place_id", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id", "pic_order"], name: "index_place_pictures_on_place_id_and_pic_order"
    t.index ["place_id"], name: "index_place_pictures_on_place_id"
  end

  create_table "places", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "address", null: false
    t.integer "bedrooms", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "deletion_date_time", null: false
    t.text "description", null: false
    t.float "gps_latitude", null: false
    t.float "gps_longitude", null: false
    t.integer "number_of_applicants", default: 0, null: false
    t.datetime "post_date", null: false
    t.integer "rent", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.integer "visitor_count", default: 0, null: false
    t.index ["gps_longitude", "gps_latitude"], name: "index_places_on_lng_lat"
    t.index ["post_date"], name: "index_places_on_post_date_desc", order: :desc
    t.index ["user_id"], name: "index_places_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "job_title"
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "password_reset_sent_at"
    t.string "password_reset_token"
    t.string "phone_number"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["password_reset_token"], name: "index_users_on_password_reset_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "applications", "places"
  add_foreign_key "applications", "users", column: "applicant_id"
  add_foreign_key "conversations", "users", column: "user1_id"
  add_foreign_key "conversations", "users", column: "user2_id"
  add_foreign_key "favorites", "places"
  add_foreign_key "favorites", "users"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "place_pictures", "places"
  add_foreign_key "places", "users"
end
