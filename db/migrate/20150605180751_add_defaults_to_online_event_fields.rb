class AddDefaultsToOnlineEventFields < ActiveRecord::Migration
  def self.up
    change_column :virtual_comp_results, :result, :float, default: 0.0
    change_column :virtual_comp_results, :highest_speed, :float, default: 0.0
    change_column :virtual_comp_results, :highest_gr, :float, default: 0.0

    change_column :virtual_competitions, :discipline_parameter, :integer, default: 0
    change_column :virtual_competitions, :range_from, :integer, default: 0
    change_column :virtual_competitions, :range_to, :integer, default: 0
    change_column :virtual_competitions, :display_highest_speed, :boolean, default: false
    change_column :virtual_competitions, :display_highest_gr, :boolean, default: false
  end

  def self.down
    change_column :virtual_comp_results, :result, :float, default: nil
    change_column :virtual_comp_results, :highest_speed, :float, default: nil
    change_column :virtual_comp_results, :highest_gr, :float, default: nil

    change_column :virtual_competitions, :discipline_parameter, :integer, default: nil
    change_column :virtual_competitions, :range_from, :integer, default: nil
    change_column :virtual_competitions, :range_to, :integer, default: nil
    change_column :virtual_competitions, :display_highest_speed, :boolean, default: nil
    change_column :virtual_competitions, :display_highest_gr, :boolean, default: nil
  end
end
