class DropScenicTopScoreViews < ActiveRecord::Migration[8.1]
  def up
    drop_view :personal_top_scores, revert_to_version: 5
    drop_view :interval_top_scores, revert_to_version: 2
    drop_view :annual_top_scores, revert_to_version: 5
    drop_view :virtual_competition_group_overall_standing_rows, revert_to_version: 2
    drop_view :virtual_competition_group_annual_standing_rows, revert_to_version: 1
  end

  def down
    create_view :virtual_competition_group_annual_standing_rows, version: 1
    create_view :virtual_competition_group_overall_standing_rows, version: 2
    create_view :annual_top_scores, version: 5
    create_view :interval_top_scores, version: 2
    create_view :personal_top_scores, version: 5
  end
end
