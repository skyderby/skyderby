class ExtractFinishLinesFromTournaments < ActiveRecord::Migration[6.0]
  def up
    add_reference :tournaments, :finish_line, foreign_key: { to_table: :place_finish_lines }

    records = execute(<<~SQL.squish).to_a
      SELECT
        finish_start_lat AS start_lat,
        finish_start_lon AS start_lon,
        finish_end_lat AS end_lat,
        finish_end_lon AS end_lon,
        tournaments.place_id,
        ARRAY_AGG(tournaments.id) AS ids,
        finishes.id AS finish_line_id
      FROM
        tournaments
        LEFT JOIN place_finish_lines AS finishes
        ON tournaments.finish_start_lat = finishes.start_latitude
        AND tournaments.finish_end_lat = finishes.end_latitude
        AND tournaments.finish_start_lon = finishes.start_longitude
        AND tournaments.finish_end_lon = finishes.end_longitude
      GROUP BY
        finish_start_lat,
        finish_start_lon,
        finish_end_lat,
        finish_end_lon,
        tournaments.place_id,
        finishes.id
    SQL

    records.each { |record| extract_finish_line(record) }

    change_table :tournaments, bulk: true do |t|
      t.remove :finish_start_lat
      t.remove :finish_start_lon
      t.remove :finish_end_lat
      t.remove :finish_end_lon
      t.remove :exit_lat
      t.remove :exit_lon
    end
  end

  def down
    change_table :tournaments, bulk: true do |t|
      t.column :finish_start_lat, :decimal, precision: 15, scale: 10
      t.column :finish_start_lon, :decimal, precision: 15, scale: 10
      t.column :finish_end_lat, :decimal, precision: 15, scale: 10
      t.column :finish_end_lon, :decimal, precision: 15, scale: 10
      t.column :exit_lat, :decimal, precision: 15, scale: 10
      t.column :exit_lon, :decimal, precision: 15, scale: 10
    end

    execute(<<~SQL.squish)
      UPDATE tournaments
      SET finish_start_lat = finish_lines.start_latitude,
        finish_start_lon = finish_lines.start_longitude,
        finish_end_lat = finish_lines.end_latitude,
        finish_end_lon = finish_lines.end_longitude,
        exit_lat = places.latitude,
        exit_lon = places.longitude
      FROM place_finish_lines
      LEFT JOIN places
      ON places.id = tournaments.place_id
      WHERE place_finish_lines.id = tournaments.finish_line_id
    SQL

    remove_column :tournaments, :finish_line_id

    execute(<<~SQL.squish)
      DELETE from place_finish_lines
      WHERE name = '## Migrated from tournaments'
    SQL
  end

  private

  def extract_finish_line(record)
    ids = record['ids'].tr('{}', '')

    if record['finish_line_id']
      execute(<<~SQL.squish)
        UPDATE tournaments 
        SET finish_line_id = #{record['finish_line_id']}
        WHERE id IN (#{ids})
      SQL
    else
      execute(<<~SQL.squish)
        WITH finish_lines AS (
          INSERT INTO place_finish_lines (
            place_id,
            name,
            start_latitude,
            start_longitude,
            end_latitude,
            end_longitude,
            created_at,
            updated_at
          )
          VALUES (
            #{record['place_id']},
            '## Migrated from tournaments',
            #{record['start_lat']},
            #{record['start_lon']},
            #{record['end_lat']},
            #{record['end_lon']},
            '#{Time.zone.now.iso8601}',
            '#{Time.zone.now.iso8601}'
          )
          RETURNING id
        )

        UPDATE tournaments
        SET finish_line_id = finish_lines.id
        FROM finish_lines
        WHERE 
          tournaments.id IN (#{ids})
      SQL
    end
  end
end
