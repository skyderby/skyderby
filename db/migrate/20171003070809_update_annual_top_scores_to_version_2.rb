class UpdateAnnualTopScoresToVersion2 < ActiveRecord::Migration[5.0]
  def change
    update_view :annual_top_scores, version: 2, revert_to_version: 1
  end
end
