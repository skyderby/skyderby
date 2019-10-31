class ChangeEventResultPrecision < ActiveRecord::Migration[5.2]
  def up
    change_column :event_results, :result, :decimal, precision: 14, scale: 5
  end

  def down
    change_column :event_results, :result, :decimal, precision: 10, scale: 2
  end
end
