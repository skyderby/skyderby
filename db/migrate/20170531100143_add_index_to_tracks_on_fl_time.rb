class AddIndexToTracksOnFlTime < ActiveRecord::Migration[5.0]
  def change
    add_index :tracks, [:id, :ff_start, :ff_end]
  end
end
