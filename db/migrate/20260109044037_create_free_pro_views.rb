class CreateFreeProViews < ActiveRecord::Migration[8.1]
  def change
    create_table :free_pro_views do |t|
      t.references :user, null: false, foreign_key: true
      t.references :track, null: false, foreign_key: true
      t.datetime :created_at, null: false
    end

    add_index :free_pro_views, [:user_id, :track_id], unique: true
    add_index :free_pro_views, [:user_id, :created_at]
  end
end
