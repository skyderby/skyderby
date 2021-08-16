class ChangeAssignedNumberToString < ActiveRecord::Migration[6.0]
  def up
    change_column :event_competitors, :assigned_number, :string
    change_column :speed_skydiving_competition_competitors, :assigned_number, :string
  end

  def down
    change_column :event_competitors, :assigned_number, :integer
    change_column :speed_skydiving_competition_competitors, :assigned_number, :integer
  end
end
