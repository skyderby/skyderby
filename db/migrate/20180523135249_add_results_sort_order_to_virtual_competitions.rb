class AddResultsSortOrderToVirtualCompetitions < ActiveRecord::Migration[5.2]
  def change
    add_column :virtual_competitions, :results_sort_order, :string, null: false, default: 'descending'
  end
end
