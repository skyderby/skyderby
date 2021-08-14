class AddCompletedAtToRounds < ActiveRecord::Migration[6.0]
  def up
    add_column :event_rounds, :completed_at, :datetime
    add_column :speed_skydiving_competition_rounds, :completed_at, :datetime

    execute(<<~SQL.squish)
      UPDATE event_rounds
      SET completed_at = NOW();

      UPDATE speed_skydiving_competition_rounds
      SET completed_at = NOW();
    SQL
  end

  def down
    remove_column :event_rounds, :completed_at
    remove_column :speed_skydiving_competition_rounds, :completed_at
  end
end
