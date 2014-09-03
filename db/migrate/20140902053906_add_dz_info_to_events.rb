class AddDzInfoToEvents < ActiveRecord::Migration
  def change
    add_column :events, :dz_info, :text
  end
end
