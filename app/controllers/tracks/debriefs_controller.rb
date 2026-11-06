module Tracks
  class DebriefsController < ApplicationController
    before_action :set_page

    def index; end

    def show = @page.debrief

    def create
      debrief = @page.request!(params[:discipline_key])
      return head(:unprocessable_content) unless debrief

      redirect_to track_debrief_path(@page.track, debrief)
    end

    private

    def set_page
      track = Track.find(params[:track_id])
      @page = Tracks::DebriefPage.new(track, viewer: Current.user, debrief_id: params[:id],
                                             reveal: params[:reveal].present?)

      return respond_not_authorized unless action_name == 'show' ? @page.readable? : @page.accessible?

      head :not_found unless @page.available?
    end
  end
end
