module Tracks
  class FlightProfilesController < ApplicationController
    def show
      @flight_profile = FlightProfile.new(params[:track_id])
    end
  end
end
