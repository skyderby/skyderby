class FlightProfilesController < ApplicationController
  include FlightProfilesScoped

  def show
    authorize @scope
    fresh_when scope_tracks

    @tracks = scope_tracks.paginate(per_page: 25, page: 1)

    respond_to do |format|
      format.html
    end
  end
end
