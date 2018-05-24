class CreateIntervalTopScores < ActiveRecord::Migration[5.2]
  def change
    create_view :interval_top_scores
  end
end
