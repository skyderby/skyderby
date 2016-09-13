class CreatePersonalTopScores < ActiveRecord::Migration
  def change
    create_view :personal_top_scores
  end
end
