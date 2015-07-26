class AddCountryToUserProfile < ActiveRecord::Migration
  def change
    add_reference :user_profiles, :country, index: true, foreign_key: true
  end
end
