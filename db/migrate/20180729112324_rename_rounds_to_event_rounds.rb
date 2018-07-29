class RenameRoundsToEventRounds < ActiveRecord::Migration[5.2]
  def change
    rename_table :rounds, :event_rounds
  end
end
