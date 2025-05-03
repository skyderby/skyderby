class FlightProfilesController < ApplicationController
  def show
    @jump_profile = Place::JumpLine.find_by(id: params[:jump_profile_id])

    @filters = [
      Profile
        .where(id: params[:profile_id])
        .pluck(:id, :name).map { |id, name| [id, name, 'profile_id[]', 'Profile'] },
      Suit
        .where(id: params[:suit_id])
        .pluck(:id, :name).map { |id, name| [id, name, 'suit_id[]', 'Suit'] },
      Place
        .where(id: params[:place_id])
        .pluck(:id, :name).map { |id, name| [id, name, 'place_id[]', 'Place'] },
      params[:year]&.map { |year| [year, year, "'year[]'", "'Year'"] }
    ].flatten(1).compact
  end
end
