class CreateImpersonations < ActiveRecord::Migration[8.1]
  def change
    create_table :impersonations do |t|
      t.references :admin_user, null: false, type: :integer, foreign_key: { to_table: :users, on_delete: :cascade }
      t.references :user, null: false, type: :integer, foreign_key: { on_delete: :cascade }
      t.references :access_token, foreign_key: { to_table: :oauth_access_tokens, on_delete: :nullify },
                                  index: { unique: true }
      t.datetime :started_at, null: false
      t.datetime :ended_at
      t.timestamps
    end
  end
end
