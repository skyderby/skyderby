class AddCountryToTeam < ActiveRecord::Migration[7.0]
  def change
    add_belongs_to :speed_skydiving_competition_teams, :country, index: false, foreign_key: true
    add_belongs_to :event_teams, :country, index: false, foreign_key: true
  end
end
