class CreateTrackResults < ActiveRecord::Migration
  def change
    create_table :track_results do |t|
      t.references :track, index: true
      t.integer :discipline
      t.integer :range_from
      t.integer :range_to
      t.float :result
    end
  end
end
