class AddAchievedAtToBadges < ActiveRecord::Migration[5.1]
  def up
    add_column :badges, :achieved_at, :date
    execute(<<~SQL)
      UPDATE badges SET achieved_at = created_at
    SQL
  end

  def down
    remove_column :badges, :achieved_at
  end
end
