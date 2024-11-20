class AddStartTimeToTournamentMatchSlots < ActiveRecord::Migration[6.0]
  def change
    add_column :tournament_match_slots, :start_time, :datetime, precision:  3
  end
end
