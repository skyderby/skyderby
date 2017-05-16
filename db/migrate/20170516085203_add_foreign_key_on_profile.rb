class AddForeignKeyOnProfile < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :badges, :profiles
    add_foreign_key :competitors, :profiles
    add_foreign_key :events, :profiles
    add_foreign_key :event_organizers, :profiles
    add_foreign_key :tracks, :profiles
    add_foreign_key :tournament_competitors, :profiles
  end
end
