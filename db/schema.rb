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

ActiveRecord::Schema.define(version: 20150531194341) do

  create_table "assignments", force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "assignments", ["user_id"], name: "index_assignments_on_user_id", using: :btree

  create_table "badges", force: true do |t|
    t.string   "name"
    t.integer  "kind"
    t.integer  "user_profile_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "competitors", force: true do |t|
    t.integer  "event_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "wingsuit_id"
    t.string   "name"
    t.integer  "section_id"
    t.integer  "user_profile_id"
  end

  add_index "competitors", ["event_id"], name: "index_competitors_on_event_id", using: :btree

  create_table "countries", force: true do |t|
    t.string "name"
    t.string "code"
  end

  create_table "event_organizers", force: true do |t|
    t.integer  "event_id"
    t.integer  "user_profile_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "event_organizers", ["event_id"], name: "index_event_organizers_on_event_id", using: :btree
  add_index "event_organizers", ["user_profile_id"], name: "index_event_organizers_on_user_profile_id", using: :btree

  create_table "event_tracks", force: true do |t|
    t.integer  "round_id"
    t.integer  "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "competitor_id"
    t.float    "result",          limit: 24
    t.integer  "user_profile_id"
  end

  add_index "event_tracks", ["round_id"], name: "index_event_tracks_on_round_id", using: :btree
  add_index "event_tracks", ["user_profile_id"], name: "index_event_tracks_on_user_profile_id", using: :btree

  create_table "events", force: true do |t|
    t.string   "name"
    t.integer  "range_from"
    t.integer  "range_to"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "status",          default: 0
    t.integer  "user_profile_id"
    t.integer  "place_id"
    t.boolean  "is_official",     default: false
  end

  create_table "manufacturers", force: true do |t|
    t.string "name"
    t.string "code"
  end

  create_table "places", force: true do |t|
    t.string  "name"
    t.decimal "latitude",    precision: 15, scale: 10
    t.decimal "longitude",   precision: 15, scale: 10
    t.text    "information"
    t.integer "country_id"
    t.integer "msl"
  end

  create_table "points", force: true do |t|
    t.integer  "tracksegment_id"
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

  create_table "roles", force: true do |t|
    t.string "name"
  end

  create_table "rounds", force: true do |t|
    t.string   "name"
    t.integer  "event_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "discipline"
    t.integer  "user_profile_id"
  end

  add_index "rounds", ["event_id"], name: "index_rounds_on_event_id", using: :btree

  create_table "sections", force: true do |t|
    t.string  "name"
    t.integer "order"
    t.integer "event_id"
  end

  add_index "sections", ["event_id"], name: "index_sections_on_event_id", using: :btree

  create_table "track_results", force: true do |t|
    t.integer "track_id"
    t.integer "discipline"
    t.integer "range_from"
    t.integer "range_to"
    t.float   "result",     limit: 24
  end

  add_index "track_results", ["track_id"], name: "index_track_results_on_track_id", using: :btree

  create_table "track_videos", force: true do |t|
    t.integer  "track_id"
    t.string   "url"
    t.decimal  "video_offset", precision: 10, scale: 2
    t.decimal  "track_offset", precision: 10, scale: 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "video_code"
  end

  add_index "track_videos", ["track_id"], name: "index_track_videos_on_track_id", using: :btree

  create_table "tracks", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "lastviewed_at"
    t.string   "suit"
    t.text     "comment"
    t.string   "location"
    t.integer  "user_id"
    t.integer  "kind",              default: 0
    t.integer  "wingsuit_id"
    t.integer  "ff_start"
    t.integer  "ff_end"
    t.boolean  "ge_enabled"
    t.integer  "visibility",        default: 0
    t.integer  "user_profile_id"
    t.integer  "place_id"
    t.integer  "gps_type",          default: 0
    t.string   "file_file_name"
    t.string   "file_content_type"
    t.integer  "file_file_size"
    t.datetime "file_updated_at"
  end

  add_index "tracks", ["user_id"], name: "index_tracks_on_user_id", using: :btree

  create_table "tracksegments", force: true do |t|
    t.integer  "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tracksegments", ["track_id"], name: "index_tracksegments_on_track_id", using: :btree

  create_table "user_profiles", force: true do |t|
    t.string   "last_name"
    t.string   "first_name"
    t.string   "name"
    t.string   "userpic_file_name"
    t.string   "userpic_content_type"
    t.integer  "userpic_file_size"
    t.datetime "userpic_updated_at"
    t.integer  "user_id"
    t.string   "facebook_profile"
    t.string   "vk_profile"
    t.integer  "dropzone_id"
    t.integer  "crop_x"
    t.integer  "crop_y"
    t.integer  "crop_w"
    t.integer  "crop_h"
  end

  add_index "user_profiles", ["user_id"], name: "index_user_profiles_on_user_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "virtual_comp_groups", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "display_on_start_page", default: false
  end

  create_table "virtual_comp_results", force: true do |t|
    t.integer  "virtual_competition_id"
    t.integer  "track_id"
    t.float    "result",                 limit: 24
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_profile_id"
    t.float    "highest_speed",          limit: 24
    t.float    "highest_gr",             limit: 24
  end

  add_index "virtual_comp_results", ["track_id"], name: "index_virtual_comp_results_on_track_id", using: :btree
  add_index "virtual_comp_results", ["virtual_competition_id"], name: "index_virtual_comp_results_on_virtual_competition_id", using: :btree

  create_table "virtual_competitions", force: true do |t|
    t.integer  "jumps_kind"
    t.integer  "suits_kind"
    t.integer  "place_id"
    t.date     "period_from"
    t.date     "period_to"
    t.integer  "discipline"
    t.integer  "discipline_parameter"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name"
    t.integer  "virtual_comp_group_id"
    t.integer  "range_from"
    t.integer  "range_to"
    t.boolean  "display_highest_speed"
    t.boolean  "display_highest_gr"
  end

  add_index "virtual_competitions", ["place_id"], name: "index_virtual_competitions_on_place_id", using: :btree

  create_table "wingsuits", force: true do |t|
    t.integer "manufacturer_id"
    t.integer "ws_class_id"
    t.string  "name"
    t.integer "kind",            default: 0
  end

  add_index "wingsuits", ["manufacturer_id"], name: "index_wingsuits_on_manufacturer_id", using: :btree
  add_index "wingsuits", ["ws_class_id"], name: "index_wingsuits_on_ws_class_id", using: :btree

end
