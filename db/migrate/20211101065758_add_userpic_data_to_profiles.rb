class AddUserpicDataToProfiles < ActiveRecord::Migration[6.0]
  def change
    add_column :profiles, :userpic_data, :jsonb
  end
end
