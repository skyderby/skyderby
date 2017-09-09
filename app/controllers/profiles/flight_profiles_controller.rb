module Profiles
  class FlightProfilesController < ApplicationController
    def show
      @profile = Profile.find(params[:profile_id])
    end
  end
end
