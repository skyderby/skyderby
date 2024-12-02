module Tracks
  class SelectOptionsController < ApplicationController
    def index
      @tracks =
        Track
        .order(recorded_at: :desc)
        .then { |tracks| profile_id ? tracks.where(profile_id: profile_id) : tracks }
        .search(search_query)
        .paginate(page:, per_page: 10)
    end

    def search_query
      params[:term]
    end

    def profile_id
      params[:profile_id]
    end
  end
end
