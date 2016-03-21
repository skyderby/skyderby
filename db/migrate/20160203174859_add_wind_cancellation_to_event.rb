class AddWindCancellationToEvent < ActiveRecord::Migration
  def change
    add_column :events, :wind_cancellation, :boolean, default: false

    Event.all.each { |x| x.update_columns(wind_cancellation: false) }
  end
end
