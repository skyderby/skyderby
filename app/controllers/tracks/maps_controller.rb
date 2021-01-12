module Tracks
  class MapsController < ApplicationController
    before_action :set_track

    def show
      authorize @track

      respond_to do |format|
        format.html
        format.json { @track_data = Skyderby::Tracks::MapsData.new(@track) }
      end
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
