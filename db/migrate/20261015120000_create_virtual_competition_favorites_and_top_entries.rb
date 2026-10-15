class CreateVirtualCompetitionFavoritesAndTopEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :virtual_competition_favorites do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :integer, index: false
      t.references :virtual_competition, null: false, foreign_key: { on_delete: :cascade }, type: :integer
      t.timestamps
    end
    add_index :virtual_competition_favorites, %i[user_id virtual_competition_id], unique: true

    create_table :virtual_competition_top_entries do |t|
      t.references :virtual_competition, null: false, foreign_key: { on_delete: :cascade }, type: :integer,
                                         index: false
      t.references :track, null: false, foreign_key: { on_delete: :cascade }, type: :integer
      t.references :profile, null: false, foreign_key: { on_delete: :cascade }, type: :integer
      t.integer :year, null: false
      t.integer :rank, null: false
      t.datetime :entered_at, null: false
      t.timestamps
    end
    add_index :virtual_competition_top_entries, %i[virtual_competition_id track_id year],
              unique: true, name: 'index_vc_top_entries_uniqueness'
    add_index :virtual_competition_top_entries, :entered_at
  end
end
