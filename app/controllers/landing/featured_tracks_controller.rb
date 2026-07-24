class Landing::FeaturedTracksController < ApplicationController
  layout false

  def show
    return redirect_to root_path unless request.format.json?

    @featured = Landing::FeaturedTrack.find(params[:key])
    return head :not_found unless @featured

    expires_in 1.day, public: true
  end
end
