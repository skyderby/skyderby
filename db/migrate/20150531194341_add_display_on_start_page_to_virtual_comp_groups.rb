class AddDisplayOnStartPageToVirtualCompGroups < ActiveRecord::Migration
  def change
    add_column :virtual_comp_groups, :display_on_start_page, :boolean, default: false
  end
end
