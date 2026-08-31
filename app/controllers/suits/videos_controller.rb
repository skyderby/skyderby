class Suits::VideosController < ApplicationController
  before_action :set_suit

  def index
    authorize @suit

    @videos =
      TrackVideo
      .includes(track: %i[pilot place suit])
      .where(track: @suit.tracks.accessible)
      .order(created_at: :desc)
  end

  private

  def set_suit
    @suit = Suit.find(params[:suit_id])
  end
end
