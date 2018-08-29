class AddApplyPenaltyToScoreToEvents < ActiveRecord::Migration[5.2]
  def change
    add_column :events, :apply_penalty_to_score, :boolean, null: false, default: false
  end
end
