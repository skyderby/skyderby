class CreatePlaceLines < ActiveRecord::Migration[5.1]
  def up
    create_table :place_lines do |t|
      t.belongs_to :place
      t.string :name

      t.timestamps
    end

    add_column :exit_measurements, :place_line_id, :integer

    place_ids = select_values(<<~SQL)
      SELECT DISTINCT place_id FROM exit_measurements
    SQL

    place_ids.each do |id|
      insert_statement = <<~SQL
        INSERT INTO place_lines (name, place_id, created_at, updated_at)
        VALUES ('Steepest', #{id}, '#{Time.current.iso8601}', '#{Time.current.iso8601}')
        RETURNING id
      SQL

      line_id = execute(insert_statement).values.flatten.first

      execute(<<~SQL)
        UPDATE exit_measurements SET place_line_id = #{line_id}
        WHERE place_id = #{id}
      SQL
    end

    remove_column :exit_measurements, :place_id
  end

  def down
    add_column :exit_measurements, :place_id, :integer

    execute(<<~SQL)
      UPDATE exit_measurements SET place_id = place_lines.id
      FROM place_lines
      WHERE place_lines.id = exit_measurements.place_line_id
    SQL

    remove_column :exit_measurements, :place_line_id

    drop_table :place_lines
  end
end
