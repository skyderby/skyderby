class Landing::FeaturedTracksController < ApplicationController
  layout false

  def show
    @featured = Landing::FeaturedTrack.find(params[:key])
    return head :not_found unless @featured

    expires_in 1.day, public: true
  end
end
