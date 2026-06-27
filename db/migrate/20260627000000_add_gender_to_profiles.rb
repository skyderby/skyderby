class AddGenderToProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :profiles, :gender, :integer
  end
end
