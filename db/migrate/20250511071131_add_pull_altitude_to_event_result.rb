class AddPullAltitudeToEventResult < ActiveRecord::Migration[7.1]
  def change
    add_column :event_results, :pull_altitude, :integer
  end
end
