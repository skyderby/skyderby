class AddPasswordSetToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :password_set, :boolean, null: false, default: false
    execute "UPDATE users SET password_set = TRUE WHERE uid IS NULL OR uid = ''"
  end

  def down
    remove_column :users, :password_set
  end
end
