class AddResultsSortOrderToVirtualCompetitionDisciplines < ActiveRecord::Migration[8.1]
  def up
    add_column :virtual_competition_disciplines, :results_sort_order, :string, default: 'descending', null: false

    execute <<~SQL.squish
      UPDATE virtual_competition_disciplines SET results_sort_order = 'ascending' WHERE discipline = 6
    SQL
  end

  def down
    remove_column :virtual_competition_disciplines, :results_sort_order
  end
end
