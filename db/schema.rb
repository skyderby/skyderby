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

ActiveRecord::Schema.define(version: 20140829070857) do

  create_table "assignments", force: true do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "assignments", ["user_id"], name: "index_assignments_on_user_id"

  create_table "competitors", force: true do |t|
    t.integer  "event_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "participation_form_id"
    t.integer  "wingsuit_id"
  end

  add_index "competitors", ["event_id"], name: "index_competitors_on_event_id"

  create_table "disciplines", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "event_tracks", force: true do |t|
    t.integer  "round_id"
    t.integer  "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "event_tracks", ["round_id"], name: "index_event_tracks_on_round_id"

  create_table "events", force: true do |t|
    t.string   "name"
    t.string   "place"
    t.datetime "start_at"
    t.datetime "end_at"
    t.integer  "comp_range_from"
    t.integer  "comp_range_to"
    t.text     "descriprion"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "form_info"
  end

  create_table "invitations", force: true do |t|
    t.integer "user_id"
    t.integer "event_id"
  end

  add_index "invitations", ["user_id"], name: "index_invitations_on_user_id"

  create_table "manufacturers", force: true do |t|
    t.string "name"
  end

  create_table "organizers", force: true do |t|
    t.integer  "event_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "orgs_admin"
    t.boolean  "competitors_admin"
    t.boolean  "rounds_admin"
    t.boolean  "tracks_admin"
  end

  add_index "organizers", ["event_id"], name: "index_organizers_on_event_id"

  create_table "participation_forms", force: true do |t|
    t.integer "user_id"
    t.integer "event_id"
    t.text    "additional_info"
    t.integer "wingsuit_id"
    t.integer "status",          default: 0
    t.text    "comment",         default: "0"
  end

  create_table "points", force: true do |t|
    t.integer  "tracksegment_id"
    t.integer  "fl_time"
    t.float    "latitude"
    t.float    "longitude"
    t.float    "elevation"
    t.string   "description"
    t.datetime "point_created_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "distance"
    t.float    "v_speed"
    t.float    "h_speed"
  end

  add_index "points", ["tracksegment_id"], name: "index_points_on_tracksegment_id"

  create_table "roles", force: true do |t|
    t.string "name"
  end

  create_table "rounds", force: true do |t|
    t.string   "name"
    t.integer  "event_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "discipline_id"
  end

  add_index "rounds", ["event_id"], name: "index_rounds_on_event_id"

  create_table "tracks", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "lastviewed_at"
    t.string   "suit"
    t.text     "comment"
    t.string   "location"
    t.integer  "user_id"
  end

  add_index "tracks", ["user_id"], name: "index_tracks_on_user_id"

  create_table "tracksegments", force: true do |t|
    t.integer  "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tracksegments", ["track_id"], name: "index_tracksegments_on_track_id"

  create_table "user_profiles", force: true do |t|
    t.string   "last_name"
    t.string   "first_name"
    t.string   "name"
    t.integer  "jumps_total"
    t.integer  "jumps_wingsuit"
    t.integer  "jumps_last_year"
    t.string   "userpic_file_name"
    t.string   "userpic_content_type"
    t.integer  "userpic_file_size"
    t.datetime "userpic_updated_at"
    t.integer  "user_id"
    t.integer  "height"
    t.integer  "weight"
    t.integer  "shirt_size"
    t.integer  "jumps_wingsuit_last_year"
    t.string   "phone_number"
  end

  add_index "user_profiles", ["user_id"], name: "index_user_profiles_on_user_id"

  create_table "user_wingsuits", force: true do |t|
    t.integer "user_id"
    t.integer "wingsuit_id"
  end

  add_index "user_wingsuits", ["user_id"], name: "index_user_wingsuits_on_user_id"

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
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

  create_table "wingsuits", force: true do |t|
    t.integer "manufacturer_id"
    t.integer "ws_class_id"
    t.string  "name"
  end

  add_index "wingsuits", ["manufacturer_id"], name: "index_wingsuits_on_manufacturer_id"
  add_index "wingsuits", ["ws_class_id"], name: "index_wingsuits_on_ws_class_id"

  create_table "ws_classes", force: true do |t|
    t.string "name"
  end

end
