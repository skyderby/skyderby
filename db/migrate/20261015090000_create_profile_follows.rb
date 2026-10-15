class CreateProfileFollows < ActiveRecord::Migration[8.1]
  def change
    create_table :profile_follows do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, type: :integer, index: false
      t.references :profile, null: false, foreign_key: { on_delete: :cascade }, type: :integer
      t.timestamps
    end

    add_index :profile_follows, %i[user_id profile_id], unique: true
  end
end
