class AddDefaultViewToVirtualCompetition < ActiveRecord::Migration[5.1]
  def change
    add_column :virtual_competitions, :default_view, :integer, default: 0, null: false
  end
end
