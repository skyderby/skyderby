class CreateTrackBookmarks < ActiveRecord::Migration[8.1]
  def change
    create_table :track_bookmarks do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :integer, index: false
      t.references :track, null: false, foreign_key: { on_delete: :cascade }, type: :integer
      t.timestamps
    end

    add_index :track_bookmarks, %i[user_id track_id], unique: true
  end
end
