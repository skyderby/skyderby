class RemoveDisciplineIdFromRound < ActiveRecord::Migration
  def change
    remove_column :rounds, :discipline_id
  end
end
