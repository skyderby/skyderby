module Profiles
  class ExitPerformancesController < ApplicationController
    def show
      @profile = Profile.find(params[:profile_id])
    end
  end
end
