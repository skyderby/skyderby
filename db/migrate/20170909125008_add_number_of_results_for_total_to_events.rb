class AddNumberOfResultsForTotalToEvents < ActiveRecord::Migration[5.1]
  def up
    add_column :events, :number_of_results_for_total, :integer

    execute(<<~SQL)
      UPDATE events
      SET number_of_results_for_total = 3
      WHERE rules = 2
    SQL
  end

  def down
    remove_column :events, :number_of_results_for_total
  end
end
