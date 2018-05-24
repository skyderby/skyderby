class UpdateAnnualTopScoresToVersion4 < ActiveRecord::Migration[5.2]
  def change
    update_view :annual_top_scores, version: 4, revert_to_version: 3
  end
end
