module Tracks
  class ComparisonsController < ApplicationController
    def create
      page = Tracks::DebriefPage.new(Track.find(params[:track_id]), viewer: Current.user)
      return respond_not_authorized unless page.accessible?
      return head(:not_found) unless page.available?

      debrief = page.compare!(Track.find_by(id: params[:other_track_id]), from: params[:from], to: params[:to])
      return head(:unprocessable_content) unless debrief

      redirect_to track_debrief_path(page.track, debrief)
    end
  end
end
