class FlightProfilesController < ApplicationController
  include FlightProfilesScoped

  def show
    authorize @scope
    fresh_when etags_for(@scope)

    @tracks = scope_tracks.paginate(per_page: 25, page: 1)
  end
end
