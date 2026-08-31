class CreateSuitExitPerformances < ActiveRecord::Migration[8.1]
  def change
    create_table :suit_exit_performances do |t|
      t.bigint :suit_id, null: false
      t.integer :pilots_count, null: false, default: 0
      t.integer :jumps_count, null: false, default: 0
      t.jsonb :samples, null: false, default: []
      t.timestamps

      t.index :suit_id, unique: true
    end
  end
end
