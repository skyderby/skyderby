class CreateUserWingsuits < ActiveRecord::Migration
  def change
    create_table :user_wingsuits do |t|
      t.references :user, index: true
      t.references :wingsuits
    end
  end
end
