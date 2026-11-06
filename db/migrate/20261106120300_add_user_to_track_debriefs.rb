class AddUserToTrackDebriefs < ActiveRecord::Migration[8.1]
  def change
    add_reference :track_debriefs, :user, type: :integer, foreign_key: { on_delete: :cascade }, index: true
  end
end
