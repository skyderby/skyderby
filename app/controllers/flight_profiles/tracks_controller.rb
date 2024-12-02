module FlightProfiles
  class TracksController < ApplicationController
    include FlightProfilesScoped

    def index
      @tracks = scope_tracks.paginate(per_page: 25, page:)
    end
  end
end
