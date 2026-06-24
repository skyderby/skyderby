class AddTopSpeedToQualificationJumps < ActiveRecord::Migration[8.1]
  def change
    add_column :qualification_jumps, :top_speed, :decimal, precision: 6, scale: 2
  end
end
