class UpdateAnnualTopScoresToVersion3 < ActiveRecord::Migration[5.2]
  def change
    update_view :annual_top_scores, version: 3, revert_to_version: 2
  end
end
