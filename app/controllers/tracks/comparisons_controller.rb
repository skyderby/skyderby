module Tracks
  class ComparisonsController < ApplicationController
    before_action :set_page

    def new
      @other = Track.find_by(id: params[:other_track_id])
      return head(:unprocessable_content) unless @page.comparable?(@other)

      @window = { from: params[:from].to_i, to: params[:to].to_i }
    end

    def create
      debrief = @page.compare!(Track.find_by(id: params[:other_track_id]), from: params[:from], to: params[:to],
                                                                           focus: params[:focus])
      return head(:unprocessable_content) unless debrief

      redirect_to track_debrief_path(@page.track, debrief)
    end

    private

    def set_page
      @page = Tracks::DebriefPage.new(Track.find(params[:track_id]), viewer: Current.user)
      return respond_not_authorized unless @page.accessible?

      head :not_found unless @page.available?
    end
  end
end
