class AddStartTimeToQualificationJump < ActiveRecord::Migration[5.1]
  def change
    add_column :qualification_jumps, :start_time_in_seconds, :decimal, precision: 17, scale: 3
  end
end
