class AddActiveToManufacturer < ActiveRecord::Migration[6.0]
  def up
    add_column :manufacturers, :active, :boolean, null: false, default: false

    execute <<~SQL
      WITH active_manufacturers AS (
        SELECT DISTINCT
          suits.manufacturer_id AS id
        FROM suits
        LEFT JOIN tracks
          ON tracks.suit_id = suits.id
          AND tracks.recorded_at > NOW() - interval '1 year'
        GROUP BY manufacturer_id
        HAVING COUNT(tracks.id) > 5
      )

      UPDATE manufacturers
      SET active = CASE
        WHEN active_manufacturers.id IS NULL
          THEN false
        ELSE true
      END
      FROM active_manufacturers
      WHERE manufacturers.id = active_manufacturers.id;
    SQL
  end

  def down
    remove_column :manufacturers, :active
  end
end
