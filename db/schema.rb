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

ActiveRecord::Schema.define(version: 20180226070838) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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

  create_table "competitors", id: :serial, force: :cascade do |t|
    t.integer "event_id"
    t.integer "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "suit_id"
    t.string "name", limit: 510
    t.integer "section_id"
    t.integer "profile_id"
    t.index ["event_id"], name: "index_competitors_on_event_id"
  end

  create_table "countries", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.string "code", limit: 510
  end

  create_table "event_tracks", id: :serial, force: :cascade do |t|
    t.integer "round_id"
    t.integer "track_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "competitor_id"
    t.decimal "result", precision: 10, scale: 2
    t.integer "profile_id"
    t.decimal "result_net", precision: 10, scale: 2
    t.boolean "is_disqualified", default: false
    t.string "disqualification_reason"
    t.index ["profile_id"], name: "index_event_tracks_on_profile_id"
    t.index ["round_id", "competitor_id"], name: "index_event_tracks_on_round_id_and_competitor_id", unique: true
    t.index ["round_id"], name: "index_event_tracks_on_round_id"
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
  end

  create_table "exit_measurements", force: :cascade do |t|
    t.integer "altitude"
    t.integer "distance"
    t.integer "place_line_id"
  end

  create_table "manufacturers", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.string "code", limit: 510
  end

  create_table "organizers", id: :serial, force: :cascade do |t|
    t.integer "organizable_id"
    t.integer "profile_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "organizable_type"
    t.index ["organizable_id"], name: "index_organizers_on_organizable_id"
    t.index ["profile_id"], name: "index_organizers_on_profile_id"
  end

  create_table "place_lines", force: :cascade do |t|
    t.bigint "place_id"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_place_lines_on_place_id"
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
    t.index "track_id, fl_time, floor(gps_time_in_seconds)", name: "points_track_fl_time"
    t.index ["track_id", "abs_altitude"], name: "points_abs_altitude"
    t.index ["track_id", "fl_time"], name: "index_points_on_track_id_and_fl_time"
    t.index ["track_id", "fl_time"], name: "points_alt_sel"
    t.index ["track_id"], name: "index_points_on_track_id"
  end

  create_table "profiles", id: :serial, force: :cascade do |t|
    t.string "last_name", limit: 510
    t.string "first_name", limit: 510
    t.string "name", limit: 510
    t.string "userpic_file_name", limit: 510
    t.string "userpic_content_type", limit: 510
    t.integer "userpic_file_size"
    t.datetime "userpic_updated_at"
    t.integer "default_units", default: 0
    t.integer "default_chart_view", default: 0
    t.integer "country_id"
    t.string "owner_type"
    t.integer "owner_id"
    t.index ["country_id"], name: "index_profiles_on_country_id"
    t.index ["country_id"], name: "user_profiles_country_id_idx"
    t.index ["owner_type", "owner_id"], name: "index_profiles_on_owner_type_and_owner_id"
  end

  create_table "qualification_jumps", id: :serial, force: :cascade do |t|
    t.integer "qualification_round_id"
    t.integer "tournament_competitor_id"
    t.decimal "result", precision: 10, scale: 3
    t.integer "track_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "start_time_in_seconds", precision: 17, scale: 3
    t.decimal "canopy_time"
    t.index ["qualification_round_id", "tournament_competitor_id"], name: "index_qualification_jumps_on_round_and_competitor", unique: true
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

  create_table "rounds", id: :serial, force: :cascade do |t|
    t.integer "event_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "discipline"
    t.integer "profile_id"
    t.integer "number"
    t.index ["event_id"], name: "index_rounds_on_event_id"
  end

  create_table "sections", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.integer "order"
    t.integer "event_id"
    t.index ["event_id"], name: "index_sections_on_event_id"
  end

  create_table "sponsors", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.string "logo_file_name", limit: 510
    t.string "logo_content_type", limit: 510
    t.integer "logo_file_size"
    t.datetime "logo_updated_at"
    t.string "website", limit: 510
    t.integer "sponsorable_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "sponsorable_type"
    t.index ["sponsorable_id", "sponsorable_type"], name: "index_sponsors_on_sponsorable_id_and_sponsorable_type"
    t.index ["sponsorable_id"], name: "event_sponsors_event_id_idx"
    t.index ["sponsorable_id"], name: "index_sponsors_on_sponsorable_id"
  end

  create_table "suits", id: :serial, force: :cascade do |t|
    t.integer "manufacturer_id"
    t.string "name", limit: 510
    t.integer "kind", default: 0
    t.string "photo_file_name", limit: 510
    t.string "photo_content_type", limit: 510
    t.integer "photo_file_size"
    t.datetime "photo_updated_at"
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

  create_table "tournament_match_competitors", id: :serial, force: :cascade do |t|
    t.decimal "result", precision: 10, scale: 3
    t.integer "tournament_competitor_id"
    t.integer "tournament_match_id"
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
    t.integer "tournament_round_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "match_type", default: 0, null: false
    t.index ["tournament_round_id"], name: "index_tournament_matches_on_tournament_round_id"
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
    t.decimal "finish_start_lat", precision: 15, scale: 10
    t.decimal "finish_start_lon", precision: 15, scale: 10
    t.decimal "finish_end_lat", precision: 15, scale: 10
    t.decimal "finish_end_lon", precision: 15, scale: 10
    t.date "starts_at"
    t.decimal "exit_lat", precision: 15, scale: 10
    t.decimal "exit_lon", precision: 15, scale: 10
    t.integer "profile_id"
    t.integer "bracket_size"
    t.boolean "has_qualification"
    t.integer "responsible_id"
    t.index ["profile_id"], name: "index_tournaments_on_profile_id"
  end

  create_table "track_files", id: :serial, force: :cascade do |t|
    t.string "file_file_name", limit: 510
    t.string "file_content_type", limit: 510
    t.integer "file_file_size"
    t.datetime "file_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["confirmation_token"], name: "users_confirmation_token_key", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email"], name: "users_email_key", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["reset_password_token"], name: "users_reset_password_token_key", unique: true
  end

  create_table "virtual_comp_groups", id: :serial, force: :cascade do |t|
    t.string "name", limit: 510
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "virtual_comp_results", id: :serial, force: :cascade do |t|
    t.integer "virtual_competition_id"
    t.integer "track_id"
    t.float "result", default: 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float "highest_speed", default: 0.0
    t.float "highest_gr", default: 0.0
    t.index ["track_id"], name: "index_virtual_comp_results_on_track_id"
    t.index ["virtual_competition_id", "track_id"], name: "index_vcomp_results_on_comp_id_and_track_id", unique: true
    t.index ["virtual_competition_id"], name: "index_virtual_comp_results_on_virtual_competition_id"
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
    t.integer "virtual_comp_group_id"
    t.integer "range_from", default: 0
    t.integer "range_to", default: 0
    t.boolean "display_highest_speed"
    t.boolean "display_highest_gr"
    t.boolean "display_on_start_page"
    t.integer "default_view", default: 0, null: false
    t.index ["place_id"], name: "index_virtual_competitions_on_place_id"
  end

  create_table "weather_data", id: :serial, force: :cascade do |t|
    t.datetime "actual_on"
    t.decimal "altitude", precision: 10, scale: 4
    t.decimal "wind_speed", precision: 10, scale: 4
    t.decimal "wind_direction", precision: 5, scale: 2
    t.integer "weather_datumable_id"
    t.string "weather_datumable_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["weather_datumable_id", "weather_datumable_type"], name: "weather_data_pk_index"
  end

  add_foreign_key "badges", "profiles"
  add_foreign_key "competitors", "profiles"
  add_foreign_key "event_tracks", "tracks"
  add_foreign_key "events", "profiles"
  add_foreign_key "organizers", "profiles"
  add_foreign_key "profiles", "countries"
  add_foreign_key "qualification_jumps", "qualification_rounds"
  add_foreign_key "qualification_jumps", "tracks"
  add_foreign_key "tournament_competitors", "profiles"
  add_foreign_key "tournaments", "profiles"
  add_foreign_key "tracks", "profiles"

  create_view "personal_top_scores",  sql_definition: <<-SQL
      SELECT row_number() OVER (PARTITION BY entities.virtual_competition_id ORDER BY entities.result DESC) AS rank,
      entities.virtual_competition_id,
      entities.track_id,
      entities.result,
      entities.highest_speed,
      entities.highest_gr,
      entities.profile_id,
      entities.suit_id,
      entities.recorded_at
     FROM ( SELECT DISTINCT ON (results.virtual_competition_id, tracks.profile_id) results.virtual_competition_id,
              results.track_id,
              results.result,
              results.highest_speed,
              results.highest_gr,
              tracks.profile_id,
              tracks.suit_id,
              tracks.recorded_at
             FROM (virtual_comp_results results
               LEFT JOIN tracks tracks ON ((tracks.id = results.track_id)))
            ORDER BY results.virtual_competition_id, tracks.profile_id, results.result DESC) entities
    ORDER BY entities.result DESC;
  SQL

  create_view "annual_top_scores",  sql_definition: <<-SQL
      SELECT row_number() OVER (PARTITION BY entities.virtual_competition_id, entities.year ORDER BY entities.result DESC) AS rank,
      entities.virtual_competition_id,
      entities.year,
      entities.track_id,
      entities.result,
      entities.highest_speed,
      entities.highest_gr,
      entities.profile_id,
      entities.suit_id,
      entities.recorded_at
     FROM ( SELECT DISTINCT ON (results.virtual_competition_id, tracks.profile_id, (date_part('year'::text, tracks.recorded_at))) results.virtual_competition_id,
              results.track_id,
              results.result,
              results.highest_speed,
              results.highest_gr,
              tracks.profile_id,
              tracks.suit_id,
              tracks.recorded_at,
              date_part('year'::text, tracks.recorded_at) AS year
             FROM (virtual_comp_results results
               LEFT JOIN tracks tracks ON ((tracks.id = results.track_id)))
            ORDER BY results.virtual_competition_id, tracks.profile_id, (date_part('year'::text, tracks.recorded_at)), results.result DESC) entities
    ORDER BY entities.result DESC;
  SQL

  create_view "event_lists",  sql_definition: <<-SQL
      SELECT events.event_type,
      events.event_id,
      events.starts_at,
      events.status,
      events.visibility,
      events.responsible_id,
      events.created_at
     FROM ( SELECT 'Event'::text AS event_type,
              events_1.id AS event_id,
              events_1.starts_at,
              events_1.status,
              events_1.visibility,
              events_1.responsible_id,
              events_1.created_at
             FROM events events_1
          UNION ALL
           SELECT 'Tournament'::text AS text,
              tournaments.id,
              tournaments.starts_at,
              1,
              0,
              tournaments.responsible_id,
              tournaments.created_at
             FROM tournaments) events
    ORDER BY events.starts_at DESC, events.created_at DESC;
  SQL

end
