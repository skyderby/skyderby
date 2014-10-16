class AddAbsAltitudeToPoints < ActiveRecord::Migration
  def change
    add_column :points, :abs_altitude, :float
  end
end
