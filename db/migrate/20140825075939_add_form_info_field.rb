class AddFormInfoField < ActiveRecord::Migration
  def change
    add_column :events, :form_info, :text
  end
end
