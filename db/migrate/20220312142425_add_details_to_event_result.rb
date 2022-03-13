class AddDetailsToEventResult < ActiveRecord::Migration[6.0]
  def change
    add_column :event_results, :exit_altitude, :decimal, precision: 10, scale: 3
    add_column :event_results, :exited_at, :datetime
    add_column :event_results, :heading_within_window, :integer
  end
end
