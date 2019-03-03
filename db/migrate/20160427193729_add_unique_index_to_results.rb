class AddUniqueIndexToResults < ActiveRecord::Migration
  def change
    delete_duplicated_track_results
    add_index :track_results, [:track_id, :discipline], unique: true

    delete_duplicated_virtual_comp_results
    add_index :virtual_comp_results,
              [:virtual_competition_id, :track_id],
              unique: true,
              name: :index_vcomp_results_on_comp_id_and_track_id
  end

  def delete_duplicated_track_results
    duplicated_keys = select_rows(<<-SQL)
      SELECT
        track_id,
        discipline
      FROM
        track_results
      GROUP BY
        track_id,
        discipline
      HAVING
        count(*) > 1
    SQL

    duplicated_keys.each do |keys|
      delete_duplicate_track_result_by_keys(keys[0], keys[1])
    end
  end

  def delete_duplicate_track_result_by_keys(track_id, discipline)
    duplicate_records = select_values(<<-SQL)
      SELECT
        id
      FROM
        track_results
      WHERE
        track_id = #{track_id}
        AND discipline = #{discipline}
    SQL

    duplicate_records.shift

    execute(<<-DELETE_SQL)
      DELETE FROM track_results
      WHERE id IN (#{duplicate_records.join(',')})
    DELETE_SQL
  end

  def delete_duplicated_virtual_comp_results
    duplicated_keys = select_rows(<<-SQL)
      SELECT
        virtual_competition_id,
        track_id
      FROM
        virtual_comp_results
      GROUP BY
        virtual_competition_id,
        track_id
      HAVING
        count(*) > 1
    SQL

    duplicated_keys.each do |keys|
      delete_duplicate_virtual_comp_result_by_keys(keys[0], keys[1])
    end
  end

  def delete_duplicate_virtual_comp_result_by_keys(competition_id, track_id)
    duplicate_records = select_values(<<-SQL)
      SELECT
        id
      FROM
        virtual_comp_results
      WHERE
        virtual_competition_id = #{competition_id}
        AND track_id = #{track_id}
    SQL

    duplicate_records.shift

    execute(<<-DELETE_SQL)
      DELETE FROM virtual_comp_results
      WHERE id IN (#{duplicate_records.join(',')})
    DELETE_SQL
  end
end
