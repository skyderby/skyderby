class RemoveProfileFromVirtualCompResult < ActiveRecord::Migration
  def change
    remove_column :virtual_comp_results, :profile_id
  end
end
