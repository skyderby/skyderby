class CreateProfileAliases < ActiveRecord::Migration[8.1]
  def change
    create_table :profile_aliases do |t|
      t.references :profile, null: false, foreign_key: true
      t.string :name, limit: 510, null: false
      t.timestamps
    end
  end
end
