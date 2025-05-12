class CreateSuitPerformanceStats < ActiveRecord::Migration[7.1]
  def change
    create_table :suit_performance_stats do |t|
      t.belongs_to :suit, null: false, foreign_key: true
      t.belongs_to :profile, null: false, foreign_key: true
      t.float :glide_ratio
      t.float :average_full_speed

      t.timestamps
    end
  end
end
