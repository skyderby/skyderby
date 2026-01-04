class CreateGiftedSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :gifted_subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.datetime :expires_at
      t.bigint :granted_by_id
      t.string :reason

      t.timestamps
    end

    add_foreign_key :gifted_subscriptions, :users, column: :granted_by_id
  end
end
