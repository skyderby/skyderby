class AddTimestampsToPlacesProfilesSuits < ActiveRecord::Migration[7.1]
  def change
    add_column :places, :created_at, :datetime, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_column :places, :updated_at, :datetime, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_column :profiles, :created_at, :datetime, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_column :profiles, :updated_at, :datetime, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_column :suits, :created_at, :datetime, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_column :suits, :updated_at, :datetime, null: false, default: -> { 'CURRENT_TIMESTAMP' }

    up_only do
      execute <<~SQL
        UPDATE places
        SET created_at = subquery.min_created_at,
            updated_at = subquery.min_created_at
        FROM (
          SELECT place_id, MIN(created_at) AS min_created_at
          FROM tracks
          GROUP BY place_id
        ) subquery
        WHERE places.id = subquery.place_id;

        UPDATE profiles
        SET created_at = subquery.min_created_at,
            updated_at = subquery.min_created_at
        FROM (
          SELECT profile_id, MIN(created_at) AS min_created_at
          FROM tracks
          GROUP BY profile_id
        ) subquery
        WHERE profiles.id = subquery.profile_id;

        UPDATE suits
        SET created_at = subquery.min_created_at,
            updated_at = subquery.min_created_at
        FROM (
          SELECT suit_id, MIN(created_at) AS min_created_at
          FROM tracks
          GROUP BY suit_id
        ) subquery
        WHERE suits.id = subquery.suit_id;
      SQL
    end
  end
end
