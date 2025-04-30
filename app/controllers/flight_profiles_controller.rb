class FlightProfilesController < ApplicationController
  def show
    @jump_profile = Place::JumpLine.find_by(id: params[:jump_profile_id])
  end
end
