class AddReferenceToProfile < ActiveRecord::Migration
  def change
    add_reference :user_profiles, :users, index: true
  end
end
