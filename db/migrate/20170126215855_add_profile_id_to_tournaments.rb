class AddProfileIdToTournaments < ActiveRecord::Migration[5.0]
  def change
    add_reference :tournaments, :profile, foreign_key: true
  end
end
