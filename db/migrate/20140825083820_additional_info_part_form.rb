class AdditionalInfoPartForm < ActiveRecord::Migration
  def change
    add_column :participation_forms, :additional_info, :text
  end
end
