class AddUserProfileToVirtualCompResult < ActiveRecord::Migration
  def change
    add_reference :virtual_comp_results, :user_profile
  end
end
