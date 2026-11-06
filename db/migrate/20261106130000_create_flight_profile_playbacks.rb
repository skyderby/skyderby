class CreateFlightProfilePlaybacks < ActiveRecord::Migration[8.1]
  def change
    create_table :flight_profile_playbacks do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.references :track, null: false, foreign_key: { on_delete: :cascade }
      t.date :month, null: false
      t.datetime :created_at, null: false
    end

    add_index :flight_profile_playbacks, %i[user_id month track_id], unique: true,
                                                                     name: 'index_flight_profile_playbacks_uniqueness'
  end
end
