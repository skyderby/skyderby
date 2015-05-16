class AddGpsTimeInSecondsToPoints < ActiveRecord::Migration
  def change
    add_column :points, :gps_time_in_seconds, :decimal, precision: 17, scale: 3

    Point.all.each do |x|
      x.update_columns(gps_time_in_seconds: x.point_created_at.to_r)
    end
  end
end
