class UpdateVirtualCompetitionGroupOverallStandingRowsToVersion2 < ActiveRecord::Migration[7.0]
  def change
    update_view :virtual_competition_group_overall_standing_rows, version: 2, revert_to_version: 1
  end
end
