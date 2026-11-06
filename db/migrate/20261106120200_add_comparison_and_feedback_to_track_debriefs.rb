class AddComparisonAndFeedbackToTrackDebriefs < ActiveRecord::Migration[8.1]
  def change
    change_table :track_debriefs, bulk: true do |t|
      t.references :other_track, type: :integer, foreign_key: { to_table: :tracks, on_delete: :cascade }, index: false
      t.integer :feedback
      t.text :feedback_comment
    end
  end
end
