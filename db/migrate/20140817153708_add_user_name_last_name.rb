class AddUserNameLastName < ActiveRecord::Migration
  def change
    add_column :users, :last_name, :string
    add_column :users, :first_name, :string
    add_column :users, :total_jumps, :integer
    add_column :users, :wingsuit_jumps, :integer
  end
end
