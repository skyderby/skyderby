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

ActiveRecord::Schema.define(version: 20140627104442) do

  create_table "points", force: true do |t|
    t.integer  "tracksegment_id"
    t.integer  "fl_time"
    t.float    "latitude",         limit: 24
    t.float    "longitude",        limit: 24
    t.float    "elevation",        limit: 24
    t.string   "description"
    t.datetime "point_created_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "distance",         limit: 24
    t.float    "v_speed",          limit: 24
    t.float    "h_speed",          limit: 24
  end

  add_index "points", ["tracksegment_id"], name: "index_points_on_tracksegment_id", using: :btree

  create_table "tracks", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "lastviewed_at"
    t.string   "suit"
    t.text     "comment"
    t.string   "location"
  end

  create_table "tracksegments", force: true do |t|
    t.integer  "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tracksegments", ["track_id"], name: "index_tracksegments_on_track_id", using: :btree

end
