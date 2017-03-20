class CreateAnnualTopScores < ActiveRecord::Migration
  def change
    create_view :annual_top_scores
  end
end
