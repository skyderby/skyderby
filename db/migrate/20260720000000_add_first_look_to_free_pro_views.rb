class AddFirstLookToFreeProViews < ActiveRecord::Migration[8.1]
  def change
    add_column :free_pro_views, :first_look, :boolean, null: false, default: false
  end
end
