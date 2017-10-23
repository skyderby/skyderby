class AddAttributesToTrack < ActiveRecord::Migration[5.1]
  def change
    add_column :tracks, :data_frequency, :decimal, precision: 3, scale: 1
    add_column :tracks, :missing_ranges, :jsonb
  end
end
