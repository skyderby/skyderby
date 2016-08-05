class AddUniqueIndexToEventTracks < ActiveRecord::Migration
  def change
    delete_duplicated_event_tracks
    add_index :event_tracks, [:round_id, :competitor_id], unique: true
  end

  def delete_duplicated_event_tracks
    duplicate_keys.each do |keys|
      duplicate_records = select_values(<<-SQL)
        SELECT
          id
        FROM
          event_tracks
        WHERE
          round_id = #{keys[0]}
          AND competitor_id = #{keys[1]}
      SQL

      duplicate_records.shift

      execute(<<-DELETE_SQL)
        DELETE FROM event_tracks 
        WHERE id IN (#{duplicate_records.join(',')})    
      DELETE_SQL
    end
  end

  def duplicate_keys
    duplicated_keys = select_rows(<<-SQL)
      SELECT
        round_id,
        competitor_id
      FROM
        event_tracks
      GROUP BY
        round_id,
        competitor_id
      HAVING
        count(*) > 1
    SQL
  end
end
