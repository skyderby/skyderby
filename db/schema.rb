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

ActiveRecord::Schema.define(version: 2022_05_21_092055) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "announcements", force: :cascade do |t|
    t.string "name", null: false
    t.string "text"
    t.datetime "period_from", null: false
    t.datetime "period_to", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "assignments", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.integer "role_id"
    t.index ["user_id"], name: "index_assignments_on_user_id"
  end

  create_table "badges", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.integer "kind"
    t.integer "profile_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "comment"
    t.integer "category", default: 0, null: false
    t.date "achieved_at"
  end

  create_table "contribution_details", force: :cascade do |t|
    t.string "contributor_type", null: false
    t.bigint "contributor_id", null: false
    t.bigint "contribution_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["contribution_id"], name: "index_contribution_details_on_contribution_id"
    t.index ["contributor_type", "contributor_id"], name: "index_contribution_details_on_contributor"
  end

  create_table "contributions", force: :cascade do |t|
    t.decimal "amount"
    t.date "received_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "countries", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.string "code", limit: 510
    t.index ["code"], name: "index_countries_on_code", unique: true
  end

  create_table "event_competitors", id: :serial, force: :cascade do |t|
    t.integer "event_id"
    t.integer "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "suit_id"
    t.string "name", limit: 510
    t.integer "section_id"
    t.integer "profile_id"
    t.bigint "team_id"
    t.string "assigned_number"
    t.index ["event_id"], name: "index_event_competitors_on_event_id"
    t.index ["team_id"], name: "index_event_competitors_on_team_id"
  end

  create_table "event_reference_point_assignments", force: :cascade do |t|
    t.bigint "round_id"
    t.bigint "competitor_id"
    t.bigint "reference_point_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["competitor_id"], name: "index_event_reference_point_assignments_on_competitor_id"
    t.index ["round_id", "competitor_id"], name: "index_reference_point_assignment_in_round_and_competitor", unique: true
    t.index ["round_id"], name: "index_event_reference_point_assignments_on_round_id"
  end

  create_table "event_reference_points", force: :cascade do |t|
    t.bigint "event_id"
    t.string "name"
    t.decimal "latitude", precision: 15, scale: 10
    t.decimal "longitude", precision: 15, scale: 10
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_reference_points_on_event_id"
  end

  create_table "event_results", id: :serial, force: :cascade do |t|
    t.integer "round_id"
    t.integer "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "competitor_id"
    t.decimal "result", precision: 14, scale: 5
    t.integer "profile_id"
    t.decimal "result_net", precision: 10, scale: 2
    t.string "penalty_reason"
    t.boolean "penalized", default: false, null: false
    t.integer "penalty_size"
    t.decimal "exit_altitude", precision: 10, scale: 3
    t.datetime "exited_at"
    t.integer "heading_within_window"
    t.index ["profile_id"], name: "index_event_results_on_profile_id"
    t.index ["round_id", "competitor_id"], name: "index_event_results_on_round_id_and_competitor_id", unique: true
    t.index ["round_id"], name: "index_event_results_on_round_id"
  end

  create_table "event_rounds", id: :serial, force: :cascade do |t|
    t.integer "event_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "discipline"
    t.integer "profile_id"
    t.integer "number"
    t.datetime "completed_at"
    t.index ["event_id"], name: "index_event_rounds_on_event_id"
  end

  create_table "event_sections", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.integer "order"
    t.integer "event_id"
    t.index ["event_id"], name: "index_event_sections_on_event_id"
  end

  create_table "event_teams", force: :cascade do |t|
    t.bigint "event_id"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_teams_on_event_id"
  end

  create_table "events", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.integer "range_from"
    t.integer "range_to"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "status", default: 0
    t.integer "profile_id"
    t.integer "place_id"
    t.boolean "is_official"
    t.integer "rules", default: 0
    t.date "starts_at"
    t.boolean "wind_cancellation", default: false
    t.integer "visibility", default: 0
    t.integer "number_of_results_for_total"
    t.integer "responsible_id"
    t.integer "designated_lane_start", default: 1, null: false
    t.boolean "apply_penalty_to_score", default: false, null: false
    t.boolean "use_teams", default: false, null: false
  end

  create_table "manufacturers", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.string "code", limit: 510
    t.boolean "active", default: false, null: false
    t.index ["code"], name: "index_manufacturers_on_code", unique: true
  end

  create_table "organizers", id: :serial, force: :cascade do |t|
    t.integer "organizable_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "organizable_type"
    t.bigint "user_id"
    t.index ["organizable_id"], name: "index_organizers_on_organizable_id"
    t.index ["user_id"], name: "index_organizers_on_user_id"
  end

  create_table "performance_competition_series", force: :cascade do |t|
    t.string "name"
    t.integer "status", default: 0, null: false
    t.integer "visibility", default: 0, null: false
    t.bigint "responsible_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "performance_competition_series_included_competitions", force: :cascade do |t|
    t.bigint "performance_competition_series_id"
    t.bigint "event_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "performance_competition_series_rounds", force: :cascade do |t|
    t.bigint "performance_competition_series_id"
    t.integer "discipline", default: 0, null: false
    t.integer "number"
    t.boolean "completed", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["performance_competition_series_id"], name: "index_rounds_on_performance_competition_series_id"
  end

  create_table "place_finish_lines", force: :cascade do |t|
    t.bigint "place_id"
    t.string "name"
    t.decimal "start_latitude", precision: 15, scale: 10
    t.decimal "start_longitude", precision: 15, scale: 10
    t.decimal "end_latitude", precision: 15, scale: 10
    t.decimal "end_longitude", precision: 15, scale: 10
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_place_finish_lines_on_place_id"
  end

  create_table "place_jump_line_measurements", force: :cascade do |t|
    t.integer "altitude"
    t.integer "distance"
    t.integer "jump_line_id"
  end

  create_table "place_jump_lines", force: :cascade do |t|
    t.bigint "place_id"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_place_jump_lines_on_place_id"
  end

  create_table "place_photos", force: :cascade do |t|
    t.bigint "place_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "image_data"
    t.index ["place_id"], name: "index_place_photos_on_place_id"
  end

  create_table "place_weather_data", id: :serial, force: :cascade do |t|
    t.datetime "actual_on"
    t.decimal "altitude", precision: 10, scale: 4
    t.decimal "wind_speed", precision: 10, scale: 4
    t.decimal "wind_direction", precision: 5, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "place_id"
    t.index ["place_id", "actual_on"], name: "index_place_weather_data_on_place_id_and_actual_on"
  end

  create_table "places", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.decimal "latitude", precision: 15, scale: 10
    t.decimal "longitude", precision: 15, scale: 10
    t.integer "country_id"
    t.decimal "msl", precision: 5, scale: 1
    t.integer "kind", default: 0, null: false
  end

  create_table "points", id: :serial, force: :cascade do |t|
    t.float "fl_time"
    t.decimal "latitude", precision: 15, scale: 10
    t.decimal "longitude", precision: 15, scale: 10
    t.float "elevation"
    t.float "distance"
    t.float "v_speed"
    t.float "h_speed"
    t.float "abs_altitude"
    t.decimal "gps_time_in_seconds", precision: 17, scale: 3
    t.integer "track_id"
    t.float "horizontal_accuracy"
    t.float "vertical_accuracy"
    t.float "speed_accuracy"
    t.float "heading_accuracy"
    t.float "heading"
    t.integer "number_of_satellites"
    t.integer "gps_fix"
    t.index ["track_id"], name: "index_points_on_track_id"
  end

  create_table "profiles", id: :serial, force: :cascade do |t|
    t.string "last_name", limit: 510
    t.string "first_name", limit: 510
    t.string "name", limit: 510
    t.integer "default_units", default: 0
    t.integer "default_chart_view", default: 0
    t.integer "country_id"
    t.string "owner_type"
    t.integer "owner_id"
    t.jsonb "userpic_data"
    t.index ["country_id"], name: "index_profiles_on_country_id"
    t.index ["country_id"], name: "user_profiles_country_id_idx"
    t.index ["owner_type", "owner_id"], name: "index_profiles_on_owner_type_and_owner_id"
  end

  create_table "qualification_jumps", id: :serial, force: :cascade do |t|
    t.integer "qualification_round_id"
    t.integer "competitor_id"
    t.decimal "result", precision: 10, scale: 3
    t.integer "track_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "start_time_in_seconds", precision: 17, scale: 3
    t.decimal "canopy_time"
    t.index ["qualification_round_id", "competitor_id"], name: "index_qualification_jumps_on_round_and_competitor", unique: true
  end

  create_table "qualification_rounds", id: :serial, force: :cascade do |t|
    t.integer "tournament_id"
    t.integer "order"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tournament_id"], name: "index_qualification_rounds_on_tournament_id"
  end

  create_table "roles", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
  end

  create_table "speed_skydiving_competition_categories", force: :cascade do |t|
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.bigint "event_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["event_id"], name: "index_speed_skydiving_competition_categories_on_event_id"
  end

  create_table "speed_skydiving_competition_competitors", force: :cascade do |t|
    t.bigint "event_id"
    t.bigint "category_id"
    t.bigint "profile_id"
    t.bigint "team_id"
    t.string "assigned_number"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["category_id"], name: "index_speed_skydiving_competition_competitors_on_category_id"
    t.index ["event_id"], name: "index_speed_skydiving_competition_competitors_on_event_id"
    t.index ["profile_id"], name: "index_speed_skydiving_competition_competitors_on_profile_id"
    t.index ["team_id"], name: "index_speed_skydiving_competition_competitors_on_team_id"
  end

  create_table "speed_skydiving_competition_result_penalties", force: :cascade do |t|
    t.bigint "result_id"
    t.integer "percent"
    t.string "reason"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["result_id"], name: "index_speed_skydiving_competition_result_penalties_on_result_id"
  end

  create_table "speed_skydiving_competition_results", force: :cascade do |t|
    t.bigint "event_id"
    t.bigint "round_id"
    t.bigint "competitor_id"
    t.bigint "track_id"
    t.decimal "result", precision: 10, scale: 5
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "window_start_time"
    t.datetime "window_end_time"
    t.float "exit_altitude"
    t.index ["competitor_id", "round_id"], name: "speed_skydiving_results_by_competitor_and_rounds", unique: true
    t.index ["competitor_id"], name: "index_speed_skydiving_competition_results_on_competitor_id"
    t.index ["event_id"], name: "index_speed_skydiving_competition_results_on_event_id"
    t.index ["round_id"], name: "index_speed_skydiving_competition_results_on_round_id"
    t.index ["track_id"], name: "index_speed_skydiving_competition_results_on_track_id"
  end

  create_table "speed_skydiving_competition_rounds", force: :cascade do |t|
    t.integer "number", default: 1, null: false
    t.bigint "event_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "completed_at"
    t.index ["event_id"], name: "index_speed_skydiving_competition_rounds_on_event_id"
  end

  create_table "speed_skydiving_competition_series", force: :cascade do |t|
    t.string "name", null: false
    t.integer "status", default: 0, null: false
    t.integer "visibility", default: 0, null: false
    t.bigint "responsible_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["responsible_id"], name: "index_speed_skydiving_competition_series_on_responsible_id"
  end

  create_table "speed_skydiving_competition_series_included_competitions", force: :cascade do |t|
    t.bigint "speed_skydiving_competition_series_id"
    t.bigint "speed_skydiving_competition_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["speed_skydiving_competition_id"], name: "index_included_competitions_on_competition_id"
    t.index ["speed_skydiving_competition_series_id"], name: "index_included_competitions_on_competition_series_id"
  end

  create_table "speed_skydiving_competition_series_rounds", force: :cascade do |t|
    t.bigint "speed_skydiving_competition_series_id"
    t.integer "number", null: false
    t.datetime "completed_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["speed_skydiving_competition_series_id"], name: "index_rounds_on_speed_skydiving_competition_series_id"
  end

  create_table "speed_skydiving_competition_teams", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "event_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["event_id"], name: "index_speed_skydiving_competition_teams_on_event_id"
  end

  create_table "speed_skydiving_competitions", force: :cascade do |t|
    t.string "name"
    t.date "starts_at"
    t.integer "status", default: 0, null: false
    t.integer "visibility", default: 0, null: false
    t.boolean "is_official", default: false, null: false
    t.boolean "use_teams", default: false, null: false
    t.bigint "responsible_id"
    t.bigint "place_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["place_id"], name: "index_speed_skydiving_competitions_on_place_id"
    t.index ["responsible_id"], name: "index_speed_skydiving_competitions_on_responsible_id"
  end

  create_table "sponsors", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.string "website", limit: 510
    t.integer "sponsorable_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "sponsorable_type"
    t.jsonb "logo_data"
    t.index ["sponsorable_id", "sponsorable_type"], name: "index_sponsors_on_sponsorable_id_and_sponsorable_type"
    t.index ["sponsorable_id"], name: "event_sponsors_event_id_idx"
    t.index ["sponsorable_id"], name: "index_sponsors_on_sponsorable_id"
  end

  create_table "suits", id: :serial, force: :cascade do |t|
    t.integer "manufacturer_id"
    t.string "name", limit: 510
    t.integer "kind", default: 0
    t.text "description"
    t.index ["manufacturer_id"], name: "index_suits_on_manufacturer_id"
  end

  create_table "tournament_competitors", id: :serial, force: :cascade do |t|
    t.integer "tournament_id"
    t.integer "profile_id"
    t.integer "suit_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_disqualified"
    t.string "disqualification_reason"
    t.index ["tournament_id"], name: "index_tournament_competitors_on_tournament_id"
  end

  create_table "tournament_match_slots", id: :serial, force: :cascade do |t|
    t.decimal "result", precision: 10, scale: 3
    t.integer "competitor_id"
    t.integer "match_id"
    t.integer "track_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_winner"
    t.boolean "is_disqualified"
    t.boolean "is_lucky_looser"
    t.string "notes", limit: 510
    t.integer "earn_medal"
  end

  create_table "tournament_matches", id: :serial, force: :cascade do |t|
    t.decimal "start_time_in_seconds", precision: 17, scale: 3
    t.integer "round_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "match_type", default: 0, null: false
    t.index ["round_id"], name: "index_tournament_matches_on_round_id"
  end

  create_table "tournament_rounds", id: :serial, force: :cascade do |t|
    t.integer "order"
    t.integer "tournament_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tournament_id"], name: "index_tournament_rounds_on_tournament_id"
  end

  create_table "tournaments", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.integer "place_id"
    t.integer "discipline"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "starts_at"
    t.integer "profile_id"
    t.integer "bracket_size"
    t.boolean "has_qualification"
    t.integer "responsible_id"
    t.integer "status", default: 0, null: false
    t.bigint "finish_line_id"
    t.index ["finish_line_id"], name: "index_tournaments_on_finish_line_id"
    t.index ["profile_id"], name: "index_tournaments_on_profile_id"
  end

  create_table "track_files", id: :serial, force: :cascade do |t|
    t.string "file_file_name", limit: 510
    t.string "file_content_type", limit: 510
    t.integer "file_file_size"
    t.datetime "file_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "file_data"
  end

  create_table "track_results", id: :serial, force: :cascade do |t|
    t.integer "track_id"
    t.integer "discipline"
    t.integer "range_from"
    t.integer "range_to"
    t.float "result"
    t.index ["track_id", "discipline"], name: "index_track_results_on_track_id_and_discipline", unique: true
    t.index ["track_id"], name: "index_track_results_on_track_id"
  end

  create_table "track_videos", id: :serial, force: :cascade do |t|
    t.integer "track_id"
    t.string "url", limit: 510
    t.decimal "video_offset", precision: 10, scale: 2
    t.decimal "track_offset", precision: 10, scale: 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "video_code", limit: 510
    t.index ["track_id"], name: "index_track_videos_on_track_id"
  end

  create_table "tracks", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "missing_suit_name", limit: 510
    t.text "comment"
    t.string "location", limit: 510
    t.integer "user_id"
    t.integer "kind", default: 0
    t.integer "suit_id"
    t.integer "ff_start"
    t.integer "ff_end"
    t.boolean "ge_enabled", default: true
    t.integer "visibility", default: 0
    t.integer "profile_id"
    t.integer "place_id"
    t.integer "gps_type", default: 0
    t.string "file_file_name", limit: 510
    t.string "file_content_type", limit: 510
    t.integer "file_file_size"
    t.datetime "file_updated_at"
    t.integer "track_file_id"
    t.decimal "ground_level", precision: 5, scale: 1, default: "0.0"
    t.datetime "recorded_at"
    t.boolean "disqualified_from_online_competitions", default: false, null: false
    t.decimal "data_frequency", precision: 3, scale: 1
    t.jsonb "missing_ranges"
    t.boolean "require_range_review", default: false, null: false
    t.string "owner_type"
    t.bigint "owner_id"
    t.json "flares"
    t.index ["id", "ff_start", "ff_end"], name: "index_tracks_on_id_and_ff_start_and_ff_end"
    t.index ["owner_type", "owner_id"], name: "index_tracks_on_owner_type_and_owner_id"
    t.index ["place_id"], name: "index_tracks_on_place_id"
    t.index ["profile_id"], name: "index_tracks_on_profile_id"
    t.index ["suit_id"], name: "index_tracks_on_suit_id"
    t.index ["user_id"], name: "index_tracks_on_user_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", limit: 510, default: "", null: false
    t.string "encrypted_password", limit: 510, default: "", null: false
    t.string "reset_password_token", limit: 510
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip", limit: 510
    t.string "last_sign_in_ip", limit: 510
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "confirmation_token", limit: 510
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email", limit: 510
    t.string "provider"
    t.string "uid"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["confirmation_token"], name: "users_confirmation_token_key", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email"], name: "users_email_key", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["reset_password_token"], name: "users_reset_password_token_key", unique: true
  end

  create_table "virtual_competition_custom_intervals", force: :cascade do |t|
    t.bigint "virtual_competition_id"
    t.string "name"
    t.string "slug"
    t.datetime "period_from"
    t.datetime "period_to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["virtual_competition_id"], name: "index_custom_intervals_on_virtual_competition_id"
  end

  create_table "virtual_competition_groups", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "virtual_competition_results", id: :serial, force: :cascade do |t|
    t.integer "virtual_competition_id"
    t.integer "track_id"
    t.float "result", default: 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float "highest_speed", default: 0.0
    t.float "highest_gr", default: 0.0
    t.boolean "wind_cancelled", default: false, null: false
    t.index ["track_id"], name: "index_virtual_competition_results_on_track_id"
    t.index ["virtual_competition_id", "track_id", "wind_cancelled"], name: "index_results_on_competition_track_wind_cancelled", unique: true
    t.index ["virtual_competition_id"], name: "index_virtual_competition_results_on_virtual_competition_id"
  end

  create_table "virtual_competitions", id: :serial, force: :cascade do |t|
    t.integer "jumps_kind"
    t.integer "suits_kind"
    t.integer "place_id"
    t.date "period_from"
    t.date "period_to"
    t.integer "discipline"
    t.integer "discipline_parameter", default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "name", limit: 510
    t.integer "group_id"
    t.integer "range_from", default: 0
    t.integer "range_to", default: 0
    t.boolean "display_highest_speed"
    t.boolean "display_highest_gr"
    t.boolean "display_on_start_page"
    t.integer "default_view", default: 0, null: false
    t.bigint "finish_line_id"
    t.integer "interval_type", default: 0, null: false
    t.string "results_sort_order", default: "descending", null: false
    t.index ["finish_line_id"], name: "index_virtual_competitions_on_finish_line_id"
    t.index ["place_id"], name: "index_virtual_competitions_on_place_id"
  end

  add_foreign_key "badges", "profiles"
  add_foreign_key "contribution_details", "contributions"
  add_foreign_key "event_competitors", "event_teams", column: "team_id"
  add_foreign_key "event_competitors", "profiles"
  add_foreign_key "event_results", "tracks"
  add_foreign_key "events", "profiles"
  add_foreign_key "performance_competition_series", "users", column: "responsible_id"
  add_foreign_key "performance_competition_series_included_competitions", "events"
  add_foreign_key "performance_competition_series_included_competitions", "performance_competition_series"
  add_foreign_key "performance_competition_series_rounds", "performance_competition_series"
  add_foreign_key "place_finish_lines", "places"
  add_foreign_key "place_weather_data", "places"
  add_foreign_key "profiles", "countries"
  add_foreign_key "qualification_jumps", "qualification_rounds"
  add_foreign_key "qualification_jumps", "tracks"
  add_foreign_key "speed_skydiving_competition_categories", "speed_skydiving_competitions", column: "event_id"
  add_foreign_key "speed_skydiving_competition_competitors", "profiles"
  add_foreign_key "speed_skydiving_competition_competitors", "speed_skydiving_competition_categories", column: "category_id"
  add_foreign_key "speed_skydiving_competition_competitors", "speed_skydiving_competition_teams", column: "team_id"
  add_foreign_key "speed_skydiving_competition_competitors", "speed_skydiving_competitions", column: "event_id"
  add_foreign_key "speed_skydiving_competition_result_penalties", "speed_skydiving_competition_results", column: "result_id"
  add_foreign_key "speed_skydiving_competition_results", "speed_skydiving_competition_competitors", column: "competitor_id"
  add_foreign_key "speed_skydiving_competition_results", "speed_skydiving_competition_rounds", column: "round_id"
  add_foreign_key "speed_skydiving_competition_results", "speed_skydiving_competitions", column: "event_id"
  add_foreign_key "speed_skydiving_competition_results", "tracks"
  add_foreign_key "speed_skydiving_competition_rounds", "speed_skydiving_competitions", column: "event_id"
  add_foreign_key "speed_skydiving_competition_teams", "speed_skydiving_competitions", column: "event_id"
  add_foreign_key "speed_skydiving_competitions", "places"
  add_foreign_key "speed_skydiving_competitions", "users", column: "responsible_id"
  add_foreign_key "tournament_competitors", "profiles"
  add_foreign_key "tournaments", "place_finish_lines", column: "finish_line_id"
  add_foreign_key "tournaments", "profiles"
  add_foreign_key "tracks", "profiles"
  add_foreign_key "virtual_competitions", "place_finish_lines", column: "finish_line_id"

  create_view "event_lists", sql_definition: <<-SQL
      SELECT events.event_type,
      events.event_id,
      events.name,
      events.rules,
      events.starts_at,
      events.status,
      events.visibility,
      events.responsible_id,
      events.place_id,
      events.range_from,
      events.range_to,
      events.is_official,
      events.competitors_count,
      events.country_ids,
      events.updated_at,
      events.created_at
     FROM ( SELECT 'Event'::text AS event_type,
              events_1.id AS event_id,
              events_1.name,
              events_1.rules,
              events_1.starts_at,
              events_1.status,
              events_1.visibility,
              events_1.responsible_id,
              events_1.place_id,
              events_1.range_from,
              events_1.range_to,
              events_1.is_official,
              COALESCE(json_object_agg(COALESCE(competitors_count.section_name, ''::character varying), competitors_count.count) FILTER (WHERE (competitors_count.section_name IS NOT NULL)), '{}'::json) AS competitors_count,
              participant_countries.country_ids,
              events_1.updated_at,
              events_1.created_at
             FROM ((events events_1
               LEFT JOIN ( SELECT sections.event_id,
                      sections.name AS section_name,
                      count(competitors.id) AS count
                     FROM (event_sections sections
                       LEFT JOIN event_competitors competitors ON (((sections.event_id = competitors.event_id) AND (sections.id = competitors.section_id))))
                    GROUP BY sections.event_id, sections.name) competitors_count ON ((events_1.id = competitors_count.event_id)))
               LEFT JOIN ( SELECT competitors.event_id,
                      COALESCE(array_agg(DISTINCT profiles.country_id) FILTER (WHERE (profiles.country_id IS NOT NULL)), ARRAY[]::integer[]) AS country_ids
                     FROM (event_competitors competitors
                       LEFT JOIN profiles profiles ON ((competitors.profile_id = profiles.id)))
                    GROUP BY competitors.event_id) participant_countries ON ((events_1.id = participant_countries.event_id)))
            GROUP BY events_1.id, participant_countries.country_ids
          UNION ALL
           SELECT 'Tournament'::text,
              tournaments.id,
              tournaments.name,
              3 AS rules,
              tournaments.starts_at,
              1,
              0,
              tournaments.responsible_id,
              tournaments.place_id,
              NULL::integer,
              NULL::integer,
              true AS bool,
              json_build_object('Open', count(competitors.id)) AS json_build_object,
              COALESCE(array_agg(DISTINCT profiles.country_id) FILTER (WHERE (profiles.country_id IS NOT NULL)), ARRAY[]::integer[]) AS "coalesce",
              tournaments.updated_at,
              tournaments.created_at
             FROM ((tournaments
               LEFT JOIN tournament_competitors competitors ON ((tournaments.id = competitors.tournament_id)))
               LEFT JOIN profiles profiles ON ((competitors.profile_id = profiles.id)))
            GROUP BY tournaments.id
          UNION ALL
           SELECT 'SpeedSkydivingCompetition'::text,
              events_1.id,
              events_1.name,
              NULL::integer,
              events_1.starts_at,
              events_1.status,
              events_1.visibility,
              events_1.responsible_id,
              events_1.place_id,
              NULL::integer,
              NULL::integer,
              events_1.is_official,
              COALESCE(json_object_agg(COALESCE(competitors_count.category_name, ''::character varying), competitors_count.count) FILTER (WHERE (competitors_count.category_name IS NOT NULL)), '{}'::json) AS "coalesce",
              participant_countries.country_ids,
              events_1.updated_at,
              events_1.created_at
             FROM ((speed_skydiving_competitions events_1
               LEFT JOIN ( SELECT categories.event_id,
                      categories.name AS category_name,
                      count(competitors.id) AS count
                     FROM (speed_skydiving_competition_categories categories
                       LEFT JOIN speed_skydiving_competition_competitors competitors ON (((categories.event_id = competitors.event_id) AND (categories.id = competitors.category_id))))
                    GROUP BY categories.event_id, categories.name) competitors_count ON ((events_1.id = competitors_count.event_id)))
               LEFT JOIN ( SELECT competitors.event_id,
                      COALESCE(array_agg(DISTINCT profiles.country_id) FILTER (WHERE (profiles.country_id IS NOT NULL)), ARRAY[]::integer[]) AS country_ids
                     FROM (speed_skydiving_competition_competitors competitors
                       LEFT JOIN profiles profiles ON ((competitors.profile_id = profiles.id)))
                    GROUP BY competitors.event_id) participant_countries ON ((events_1.id = participant_countries.event_id)))
            GROUP BY events_1.id, participant_countries.country_ids
          UNION ALL
           SELECT 'PerformanceCompetitionSeries'::text,
              series.id,
              series.name,
              NULL::integer,
              min(events_1.starts_at) AS min,
              series.status,
              series.visibility,
              series.responsible_id,
              NULL::bigint,
              NULL::integer,
              NULL::integer,
              true AS bool,
              json_object_agg(events_1.name, competitors_count.count) FILTER (WHERE (events_1.name IS NOT NULL)) AS json_object_agg,
              participant_countries.country_ids,
              series.updated_at,
              series.created_at
             FROM ((((performance_competition_series series
               LEFT JOIN performance_competition_series_included_competitions included_competitions ON ((series.id = included_competitions.performance_competition_series_id)))
               LEFT JOIN events events_1 ON ((included_competitions.event_id = events_1.id)))
               LEFT JOIN ( SELECT competitors.event_id,
                      count(competitors.id) AS count
                     FROM (event_competitors competitors
                       JOIN performance_competition_series_included_competitions included_competitions_1 ON ((included_competitions_1.event_id = competitors.event_id)))
                    GROUP BY competitors.event_id) competitors_count ON ((events_1.id = competitors_count.event_id)))
               LEFT JOIN ( SELECT included_competitions_1.performance_competition_series_id,
                      COALESCE(array_agg(DISTINCT profiles.country_id) FILTER (WHERE (profiles.country_id IS NOT NULL)), ARRAY[]::integer[]) AS country_ids
                     FROM ((event_competitors competitors
                       JOIN performance_competition_series_included_competitions included_competitions_1 ON ((included_competitions_1.event_id = competitors.event_id)))
                       LEFT JOIN profiles profiles ON ((competitors.profile_id = profiles.id)))
                    GROUP BY included_competitions_1.performance_competition_series_id) participant_countries ON ((series.id = participant_countries.performance_competition_series_id)))
            GROUP BY series.id, participant_countries.country_ids
          UNION ALL
           SELECT 'SpeedSkydivingCompetitionSeries'::text,
              series.id,
              series.name,
              NULL::integer,
              min(events_1.starts_at) AS min,
              series.status,
              series.visibility,
              series.responsible_id,
              NULL::bigint,
              NULL::integer,
              NULL::integer,
              true AS bool,
              json_object_agg(events_1.name, competitors_count.count) FILTER (WHERE (events_1.name IS NOT NULL)) AS json_object_agg,
              participant_countries.country_ids,
              series.updated_at,
              series.created_at
             FROM ((((speed_skydiving_competition_series series
               LEFT JOIN speed_skydiving_competition_series_included_competitions included_competitions ON ((series.id = included_competitions.speed_skydiving_competition_series_id)))
               LEFT JOIN speed_skydiving_competitions events_1 ON ((included_competitions.speed_skydiving_competition_id = events_1.id)))
               LEFT JOIN ( SELECT competitors.event_id,
                      count(competitors.id) AS count
                     FROM (speed_skydiving_competition_competitors competitors
                       JOIN speed_skydiving_competition_series_included_competitions included_competitions_1 ON ((included_competitions_1.speed_skydiving_competition_id = competitors.event_id)))
                    GROUP BY competitors.event_id) competitors_count ON ((events_1.id = competitors_count.event_id)))
               LEFT JOIN ( SELECT competitors.event_id,
                      COALESCE(array_agg(DISTINCT profiles.country_id) FILTER (WHERE (profiles.country_id IS NOT NULL)), ARRAY[]::integer[]) AS country_ids
                     FROM ((speed_skydiving_competition_competitors competitors
                       JOIN speed_skydiving_competition_series_included_competitions included_competitions_1 ON ((included_competitions_1.speed_skydiving_competition_id = competitors.event_id)))
                       LEFT JOIN profiles profiles ON ((competitors.profile_id = profiles.id)))
                    GROUP BY competitors.event_id) participant_countries ON ((events_1.id = participant_countries.event_id)))
            GROUP BY series.id, participant_countries.country_ids) events
    ORDER BY events.starts_at DESC, events.created_at DESC;
  SQL
  create_view "interval_top_scores", sql_definition: <<-SQL
      SELECT row_number() OVER (PARTITION BY entities.virtual_competition_id, entities.custom_interval_id, entities.wind_cancelled ORDER BY
          CASE
              WHEN ((entities.results_sort_order)::text = 'descending'::text) THEN entities.result
              ELSE (- entities.result)
          END DESC) AS rank,
      entities.virtual_competition_id,
      entities.track_id,
      entities.result,
      entities.highest_speed,
      entities.highest_gr,
      entities.profile_id,
      entities.suit_id,
      entities.custom_interval_id,
      entities.wind_cancelled,
      entities.recorded_at
     FROM ( SELECT DISTINCT ON (results.virtual_competition_id, tracks.profile_id, intervals.id, results.wind_cancelled) results.virtual_competition_id,
              results.track_id,
              results.result,
              results.highest_speed,
              results.highest_gr,
              results.wind_cancelled,
              tracks.profile_id,
              tracks.suit_id,
              tracks.recorded_at,
              competitions.results_sort_order,
              intervals.id AS custom_interval_id
             FROM (((virtual_competition_results results
               JOIN virtual_competitions competitions ON ((results.virtual_competition_id = competitions.id)))
               LEFT JOIN tracks tracks ON ((tracks.id = results.track_id)))
               JOIN virtual_competition_custom_intervals intervals ON (((intervals.virtual_competition_id = competitions.id) AND ((tracks.recorded_at >= intervals.period_from) AND (tracks.recorded_at <= intervals.period_to)))))
            ORDER BY results.virtual_competition_id, tracks.profile_id, intervals.id, results.wind_cancelled,
                  CASE
                      WHEN ((competitions.results_sort_order)::text = 'descending'::text) THEN results.result
                      ELSE (- results.result)
                  END DESC) entities
    ORDER BY
          CASE
              WHEN ((entities.results_sort_order)::text = 'descending'::text) THEN entities.result
              ELSE (- entities.result)
          END DESC;
  SQL
  create_view "annual_top_scores", sql_definition: <<-SQL
      SELECT row_number() OVER (PARTITION BY entities.virtual_competition_id, entities.year, entities.wind_cancelled ORDER BY
          CASE
              WHEN ((entities.results_sort_order)::text = 'descending'::text) THEN entities.result
              ELSE (- entities.result)
          END DESC) AS rank,
      entities.virtual_competition_id,
      entities.year,
      entities.track_id,
      entities.result,
      entities.highest_speed,
      entities.highest_gr,
      entities.profile_id,
      entities.suit_id,
      entities.recorded_at,
      entities.wind_cancelled
     FROM ( SELECT DISTINCT ON (results.virtual_competition_id, tracks.profile_id, results.wind_cancelled, (date_part('year'::text, tracks.recorded_at))) results.virtual_competition_id,
              results.track_id,
              results.result,
              results.highest_speed,
              results.highest_gr,
              results.wind_cancelled,
              tracks.profile_id,
              tracks.suit_id,
              tracks.recorded_at,
              competitions.results_sort_order,
              date_part('year'::text, tracks.recorded_at) AS year
             FROM ((virtual_competition_results results
               JOIN virtual_competitions competitions ON ((results.virtual_competition_id = competitions.id)))
               LEFT JOIN tracks tracks ON ((tracks.id = results.track_id)))
            ORDER BY results.virtual_competition_id, tracks.profile_id, results.wind_cancelled, (date_part('year'::text, tracks.recorded_at)),
                  CASE
                      WHEN ((competitions.results_sort_order)::text = 'descending'::text) THEN results.result
                      ELSE (- results.result)
                  END DESC) entities
    ORDER BY
          CASE
              WHEN ((entities.results_sort_order)::text = 'descending'::text) THEN entities.result
              ELSE (- entities.result)
          END DESC;
  SQL
  create_view "personal_top_scores", sql_definition: <<-SQL
      SELECT row_number() OVER (PARTITION BY entities.virtual_competition_id, entities.wind_cancelled ORDER BY
          CASE
              WHEN ((entities.results_sort_order)::text = 'descending'::text) THEN entities.result
              ELSE (- entities.result)
          END DESC) AS rank,
      entities.virtual_competition_id,
      entities.track_id,
      entities.result,
      entities.highest_speed,
      entities.highest_gr,
      entities.wind_cancelled,
      entities.profile_id,
      entities.suit_id,
      entities.recorded_at,
      entities.results_sort_order
     FROM ( SELECT DISTINCT ON (results.virtual_competition_id, results.wind_cancelled, tracks.profile_id) results.virtual_competition_id,
              results.track_id,
              results.result,
              results.highest_speed,
              results.highest_gr,
              results.wind_cancelled,
              tracks.profile_id,
              tracks.suit_id,
              tracks.recorded_at,
              competitions.results_sort_order
             FROM ((virtual_competition_results results
               JOIN virtual_competitions competitions ON ((results.virtual_competition_id = competitions.id)))
               LEFT JOIN tracks tracks ON ((tracks.id = results.track_id)))
            ORDER BY results.virtual_competition_id, results.wind_cancelled, tracks.profile_id,
                  CASE
                      WHEN ((competitions.results_sort_order)::text = 'descending'::text) THEN results.result
                      ELSE (- results.result)
                  END DESC) entities
    ORDER BY
          CASE
              WHEN ((entities.results_sort_order)::text = 'descending'::text) THEN entities.result
              ELSE (- entities.result)
          END DESC;
  SQL
end
