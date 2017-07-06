class AddCanopyTimeToQualificationJump < ActiveRecord::Migration[5.1]
  def change
    add_column :qualification_jumps, :canopy_time, :decimal
  end
end
