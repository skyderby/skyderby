class ChangeNameOfStartTimeInMatches < ActiveRecord::Migration
  def change
    rename_column :tournament_matches, :start_time, :start_time_in_seconds
  end
end
