module Tracks
  class MapsController < ApplicationController
    before_action :set_track

    def show
      authorize @track

      @map_data = Track::MapData.new(@track)
    end

    private

    def set_track
      @track = Track.includes(
        { suit: :manufacturer },
        { place: :country },
        :video
      ).find(params[:track_id])
    end
  end
end
