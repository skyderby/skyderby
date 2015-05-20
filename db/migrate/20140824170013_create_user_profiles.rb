class CreateUserProfiles < ActiveRecord::Migration
  def change
    create_table :user_profiles do |t|
      t.string :last_name
      t.string :first_name
      t.string :name

      t.integer :jumps_total
      t.integer :jumps_wingsuit
      t.integer :jumps_last_year

      t.attachment :userpic
    end

    remove_column :users, :last_name
    remove_column :users, :first_name
    remove_column :users, :name
    remove_column :users, :total_jumps
    remove_column :users, :wingsuit_jumps
  end
end
