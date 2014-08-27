class RemoveWrongColumn < ActiveRecord::Migration
  def change
    remove_column :user_profiles, :users
    add_reference :user_profiles, :user, :index => true
  end
end
