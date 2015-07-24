class AddRulesToEvents < ActiveRecord::Migration
  def change
    add_column :events, :rules, :integer, default: 0
  end
end
