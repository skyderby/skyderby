class CreateBadges < ActiveRecord::Migration
  def change
    create_table :badges do |t|
      t.string :name
      t.integer :type
      t.references :user_profile

      t.timestamps
    end
  end
end
