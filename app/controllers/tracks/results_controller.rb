module Tracks
  class ResultsController < ApplicationController
    def show
      @track = Track.find(params[:track_id])
      authorize @track

      respond_to do |format|
        format.html { redirect_to @track }
        format.js
      end
    end
  end
end
