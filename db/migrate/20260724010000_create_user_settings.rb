class CreateUserSettings < ActiveRecord::Migration[8.1]
  MOVED_COLUMNS = %i[dashboard_mode dashboard_female_rankings default_units default_chart_view
                     speed_skydiving_units].freeze

  def up
    create_table :user_settings do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :dashboard_mode
      t.boolean :dashboard_female_rankings, null: false, default: false
      t.integer :default_units, null: false, default: 0
      t.integer :default_chart_view, null: false, default: 0
      t.integer :speed_skydiving_units, null: false, default: 0
      t.string :journal_period, null: false, default: '1y'
      t.timestamps
    end

    execute <<~SQL.squish
      INSERT INTO user_settings
        (user_id, dashboard_mode, dashboard_female_rankings, default_units, default_chart_view,
         speed_skydiving_units, created_at, updated_at)
      SELECT p.owner_id, p.dashboard_mode, p.dashboard_female_rankings, p.default_units, p.default_chart_view,
             p.speed_skydiving_units, NOW(), NOW()
      FROM profiles p
      INNER JOIN users u ON u.id = p.owner_id
      WHERE p.owner_type = 'User'
      ON CONFLICT (user_id) DO NOTHING
    SQL

    change_table :profiles, bulk: true do |t|
      t.remove(*MOVED_COLUMNS)
    end
  end

  def down
    change_table :profiles, bulk: true do |t|
      t.string :dashboard_mode
      t.boolean :dashboard_female_rankings, null: false, default: false
      t.integer :default_units, null: false, default: 0
      t.integer :default_chart_view, null: false, default: 0
      t.integer :speed_skydiving_units, null: false, default: 0
    end

    execute <<~SQL.squish
      UPDATE profiles SET
        dashboard_mode = us.dashboard_mode,
        dashboard_female_rankings = us.dashboard_female_rankings,
        default_units = us.default_units,
        default_chart_view = us.default_chart_view,
        speed_skydiving_units = us.speed_skydiving_units
      FROM user_settings us
      WHERE profiles.owner_type = 'User' AND profiles.owner_id = us.user_id
    SQL

    drop_table :user_settings
  end
end
