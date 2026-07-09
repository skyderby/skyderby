module Tracks
  class ResultsController < ApplicationController
    def show
      @track = Track.find(params[:track_id])
      return respond_not_authorized unless @track.viewable?

      @results = Tracks::Results.new(@track)

      respond_to do |format|
        format.html { redirect_to @track }
        format.turbo_stream
      end
    end
  end
end
