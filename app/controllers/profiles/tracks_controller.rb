module Profiles
  class TracksController < ApplicationController
    def index
      profile = Profile.find(params[:profile_id])
      tracks =
        policy_scope(profile.tracks)
        .includes(:distance, :speed, :time, :video, suit: :manufacturer, place: :country)
        .paginate(page: params[:page], per_page: 25)

      @profile = Profiles::Tracks.new(profile, tracks)
    end
  end
end
