class AddProfileToCompetitors < ActiveRecord::Migration
  def change
    add_reference :competitors, :user_profile
  end
end
