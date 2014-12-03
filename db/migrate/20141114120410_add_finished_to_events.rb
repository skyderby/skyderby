class AddFinishedToEvents < ActiveRecord::Migration
  def change
    add_column :events, :finished, :boolean
  end
end
