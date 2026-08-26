class CreatePlaceSubmissions < ActiveRecord::Migration[8.1]
  def change
    create_table :place_submissions do |t|
      t.bigint :place_id, null: false
      t.bigint :user_id, null: false
      t.bigint :track_id
      t.timestamps

      t.index :place_id, unique: true
      t.index :user_id
      t.index :track_id
    end
  end
end
