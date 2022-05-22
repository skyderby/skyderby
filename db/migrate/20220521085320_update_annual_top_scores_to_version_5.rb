class UpdateAnnualTopScoresToVersion5 < ActiveRecord::Migration[6.0]
  def change
    update_view :annual_top_scores, version: 5, revert_to_version: 4
  end
end
