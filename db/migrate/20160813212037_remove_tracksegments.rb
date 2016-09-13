class RemoveTracksegments < ActiveRecord::Migration
  def up
    add_reference :points, :track, index: true

    execute(<<-SQL)
      UPDATE points AS points
      SET track_id = tracksegments.track_id
      FROM tracksegments AS tracksegments
      WHERE points.tracksegment_id = tracksegments.id
    SQL

    remove_column :points, :tracksegment_id
    drop_table :tracksegments
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
