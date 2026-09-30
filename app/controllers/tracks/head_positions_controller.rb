class Tracks::HeadPositionsController < ApplicationController
  def show
    @track = Track.find(params[:track_id])
    return respond_not_authorized unless @track.viewable? && @track.pro_view_available?

    @positions = @track.head_up_check.positions
  end
end
