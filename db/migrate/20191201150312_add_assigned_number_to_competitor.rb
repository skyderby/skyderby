class AddAssignedNumberToCompetitor < ActiveRecord::Migration[5.2]
  def change
    add_column :event_competitors, :assigned_number, :integer
  end
end
