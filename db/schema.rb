# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150713061341) do

  create_table "assignments", force: :cascade do |t|
    t.integer "user_id", limit: 4
    t.integer "role_id", limit: 4
  end

  add_index "assignments", ["user_id"], name: "index_assignments_on_user_id", using: :btree

  create_table "badges", force: :cascade do |t|
    t.string   "name",            limit: 255
    t.integer  "kind",            limit: 4
    t.integer  "user_profile_id", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "competitors", force: :cascade do |t|
    t.integer  "event_id",        limit: 4
    t.integer  "user_id",         limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "wingsuit_id",     limit: 4
    t.string   "name",            limit: 255
    t.integer  "section_id",      limit: 4
    t.integer  "user_profile_id", limit: 4
  end

  add_index "competitors", ["event_id"], name: "index_competitors_on_event_id", using: :btree

  create_table "countries", force: :cascade do |t|
    t.string "name", limit: 255
    t.string "code", limit: 255
  end

  create_table "event_organizers", force: :cascade do |t|
    t.integer  "event_id",        limit: 4
    t.integer  "user_profile_id", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "event_organizers", ["event_id"], name: "index_event_organizers_on_event_id", using: :btree
  add_index "event_organizers", ["user_profile_id"], name: "index_event_organizers_on_user_profile_id", using: :btree

  create_table "event_tracks", force: :cascade do |t|
    t.integer  "round_id",        limit: 4
    t.integer  "track_id",        limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "competitor_id",   limit: 4
    t.float    "result",          limit: 24
    t.integer  "user_profile_id", limit: 4
  end

  add_index "event_tracks", ["round_id"], name: "index_event_tracks_on_round_id", using: :btree
  add_index "event_tracks", ["user_profile_id"], name: "index_event_tracks_on_user_profile_id", using: :btree

  create_table "events", force: :cascade do |t|
    t.string   "name",            limit: 255
    t.integer  "range_from",      limit: 4
    t.integer  "range_to",        limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "status",          limit: 4,   default: 0
    t.integer  "user_profile_id", limit: 4
    t.integer  "place_id",        limit: 4
    t.boolean  "is_official",     limit: 1,   default: false
    t.integer  "rules",           limit: 4,   default: 0
  end

  create_table "manufacturers", force: :cascade do |t|
    t.string "name", limit: 255
    t.string "code", limit: 255
  end

  create_table "places", force: :cascade do |t|
    t.string  "name",        limit: 255
    t.decimal "latitude",                  precision: 15, scale: 10
    t.decimal "longitude",                 precision: 15, scale: 10
    t.text    "information", limit: 65535
    t.integer "country_id",  limit: 4
    t.integer "msl",         limit: 4
  end

  create_table "points", force: :cascade do |t|
    t.integer  "tracksegment_id",     limit: 4
    t.float    "fl_time",             limit: 24
    t.decimal  "latitude",                       precision: 15, scale: 10
    t.decimal  "longitude",                      precision: 15, scale: 10
    t.float    "elevation",           limit: 24
    t.datetime "point_created_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "distance",            limit: 24
    t.float    "v_speed",             limit: 24
    t.float    "h_speed",             limit: 24
    t.float    "abs_altitude",        limit: 24
    t.decimal  "gps_time_in_seconds",            precision: 17, scale: 3
  end

  add_index "points", ["tracksegment_id"], name: "index_points_on_tracksegment_id", using: :btree

  create_table "qualification_jumps", force: :cascade do |t|
    t.integer  "qualification_round_id",   limit: 4
    t.integer  "tournament_competitor_id", limit: 4
    t.decimal  "result",                             precision: 10, scale: 3
    t.integer  "track_id",                 limit: 4
    t.datetime "created_at",                                                  null: false
    t.datetime "updated_at",                                                  null: false
  end

  create_table "qualification_rounds", force: :cascade do |t|
    t.integer  "tournament_id", limit: 4
    t.integer  "order",         limit: 4
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  add_index "qualification_rounds", ["tournament_id"], name: "index_qualification_rounds_on_tournament_id", using: :btree

  create_table "roles", force: :cascade do |t|
    t.string "name", limit: 255
  end

  create_table "rounds", force: :cascade do |t|
    t.string   "name",            limit: 255
    t.integer  "event_id",        limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "discipline",      limit: 4
    t.integer  "user_profile_id", limit: 4
  end

  add_index "rounds", ["event_id"], name: "index_rounds_on_event_id", using: :btree

  create_table "sections", force: :cascade do |t|
    t.string  "name",     limit: 255
    t.integer "order",    limit: 4
    t.integer "event_id", limit: 4
  end

  add_index "sections", ["event_id"], name: "index_sections_on_event_id", using: :btree

  create_table "tournament_competitors", force: :cascade do |t|
    t.integer  "tournament_id",   limit: 4
    t.integer  "user_profile_id", limit: 4
    t.integer  "wingsuit_id",     limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "tournament_competitors", ["tournament_id"], name: "index_tournament_competitors_on_tournament_id", using: :btree

  create_table "tournament_match_competitors", force: :cascade do |t|
    t.decimal  "result",                               precision: 10, scale: 3
    t.integer  "tournament_competitor_id", limit: 4
    t.integer  "tournament_match_id",      limit: 4
    t.integer  "track_id",                 limit: 4
    t.datetime "created_at",                                                    null: false
    t.datetime "updated_at",                                                    null: false
    t.boolean  "is_winner",                limit: 1
    t.boolean  "is_disqualified",          limit: 1
    t.boolean  "is_lucky_looser",          limit: 1
    t.string   "notes",                    limit: 255
    t.integer  "earn_medal",               limit: 4
  end

  create_table "tournament_matches", force: :cascade do |t|
    t.decimal  "start_time_in_seconds",           precision: 17, scale: 3
    t.integer  "tournament_round_id",   limit: 4
    t.datetime "created_at",                                                               null: false
    t.datetime "updated_at",                                                               null: false
    t.boolean  "gold_finals",           limit: 1,                          default: false
    t.boolean  "bronze_finals",         limit: 1,                          default: false
  end

  add_index "tournament_matches", ["tournament_round_id"], name: "index_tournament_matches_on_tournament_round_id", using: :btree

  create_table "tournament_rounds", force: :cascade do |t|
    t.integer  "order",         limit: 4
    t.integer  "tournament_id", limit: 4
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  add_index "tournament_rounds", ["tournament_id"], name: "index_tournament_rounds_on_tournament_id", using: :btree

  create_table "tournaments", force: :cascade do |t|
    t.string   "name",             limit: 255
    t.integer  "place_id",         limit: 4
    t.integer  "discipline",       limit: 4
    t.datetime "created_at",                                             null: false
    t.datetime "updated_at",                                             null: false
    t.decimal  "finish_start_lat",             precision: 15, scale: 10
    t.decimal  "finish_start_lon",             precision: 15, scale: 10
    t.decimal  "finish_end_lat",               precision: 15, scale: 10
    t.decimal  "finish_end_lon",               precision: 15, scale: 10
  end

  create_table "track_files", force: :cascade do |t|
    t.string   "file_file_name",    limit: 255
    t.string   "file_content_type", limit: 255
    t.integer  "file_file_size",    limit: 4
    t.datetime "file_updated_at"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "track_results", force: :cascade do |t|
    t.integer "track_id",   limit: 4
    t.integer "discipline", limit: 4
    t.integer "range_from", limit: 4
    t.integer "range_to",   limit: 4
    t.float   "result",     limit: 24
  end

  add_index "track_results", ["track_id"], name: "index_track_results_on_track_id", using: :btree

  create_table "track_videos", force: :cascade do |t|
    t.integer  "track_id",     limit: 4
    t.string   "url",          limit: 255
    t.decimal  "video_offset",             precision: 10, scale: 2
    t.decimal  "track_offset",             precision: 10, scale: 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "video_code",   limit: 255
  end

  add_index "track_videos", ["track_id"], name: "index_track_videos_on_track_id", using: :btree

  create_table "tracks", force: :cascade do |t|
    t.string   "name",              limit: 255
    t.datetime "created_at"
    t.datetime "lastviewed_at"
    t.string   "suit",              limit: 255
    t.text     "comment",           limit: 65535
    t.string   "location",          limit: 255
    t.integer  "user_id",           limit: 4
    t.integer  "kind",              limit: 4,     default: 0
    t.integer  "wingsuit_id",       limit: 4
    t.integer  "ff_start",          limit: 4
    t.integer  "ff_end",            limit: 4
    t.boolean  "ge_enabled",        limit: 1,     default: true
    t.integer  "visibility",        limit: 4,     default: 0
    t.integer  "user_profile_id",   limit: 4
    t.integer  "place_id",          limit: 4
    t.integer  "gps_type",          limit: 4,     default: 0
    t.string   "file_file_name",    limit: 255
    t.string   "file_content_type", limit: 255
    t.integer  "file_file_size",    limit: 4
    t.datetime "file_updated_at"
    t.integer  "track_file_id",     limit: 4
    t.integer  "ground_level",      limit: 4,     default: 0
  end

  add_index "tracks", ["user_id"], name: "index_tracks_on_user_id", using: :btree

  create_table "tracksegments", force: :cascade do |t|
    t.integer  "track_id",   limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tracksegments", ["track_id"], name: "index_tracksegments_on_track_id", using: :btree

  create_table "user_profiles", force: :cascade do |t|
    t.string   "last_name",            limit: 255
    t.string   "first_name",           limit: 255
    t.string   "name",                 limit: 255
    t.string   "userpic_file_name",    limit: 255
    t.string   "userpic_content_type", limit: 255
    t.integer  "userpic_file_size",    limit: 4
    t.datetime "userpic_updated_at"
    t.integer  "user_id",              limit: 4
    t.string   "facebook_profile",     limit: 255
    t.string   "vk_profile",           limit: 255
    t.integer  "dropzone_id",          limit: 4
    t.integer  "crop_x",               limit: 4
    t.integer  "crop_y",               limit: 4
    t.integer  "crop_w",               limit: 4
    t.integer  "crop_h",               limit: 4
    t.integer  "default_units",        limit: 4,   default: 0
    t.integer  "default_chart_view",   limit: 4,   default: 0
  end

  add_index "user_profiles", ["user_id"], name: "index_user_profiles_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,   default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "confirmation_token",     limit: 255
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email",      limit: 255
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "virtual_comp_groups", force: :cascade do |t|
    t.string   "name",                  limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "display_on_start_page", limit: 1,   default: false
  end

  create_table "virtual_comp_results", force: :cascade do |t|
    t.integer  "virtual_competition_id", limit: 4
    t.integer  "track_id",               limit: 4
    t.float    "result",                 limit: 24, default: 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_profile_id",        limit: 4
    t.float    "highest_speed",          limit: 24, default: 0.0
    t.float    "highest_gr",             limit: 24, default: 0.0
  end

  add_index "virtual_comp_results", ["track_id"], name: "index_virtual_comp_results_on_track_id", using: :btree
  add_index "virtual_comp_results", ["virtual_competition_id"], name: "index_virtual_comp_results_on_virtual_competition_id", using: :btree

  create_table "virtual_competitions", force: :cascade do |t|
    t.integer  "jumps_kind",            limit: 4
    t.integer  "suits_kind",            limit: 4
    t.integer  "place_id",              limit: 4
    t.date     "period_from"
    t.date     "period_to"
    t.integer  "discipline",            limit: 4
    t.integer  "discipline_parameter",  limit: 4,   default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",                  limit: 255
    t.integer  "virtual_comp_group_id", limit: 4
    t.integer  "range_from",            limit: 4,   default: 0
    t.integer  "range_to",              limit: 4,   default: 0
    t.boolean  "display_highest_speed", limit: 1,   default: false
    t.boolean  "display_highest_gr",    limit: 1,   default: false
  end

  add_index "virtual_competitions", ["place_id"], name: "index_virtual_competitions_on_place_id", using: :btree

  create_table "wingsuits", force: :cascade do |t|
    t.integer  "manufacturer_id",    limit: 4
    t.string   "name",               limit: 255
    t.integer  "kind",               limit: 4,     default: 0
    t.string   "photo_file_name",    limit: 255
    t.string   "photo_content_type", limit: 255
    t.integer  "photo_file_size",    limit: 4
    t.datetime "photo_updated_at"
    t.text     "description",        limit: 65535
  end

  add_index "wingsuits", ["manufacturer_id"], name: "index_wingsuits_on_manufacturer_id", using: :btree

end
