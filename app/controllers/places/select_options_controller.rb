module Places
  class SelectOptionsController < ApplicationController
    def index
      @places =
        Place.select('countries.name as country_name, places.id, places.name')
             .joins(:country)
             .order('countries.name, name')

      @places = @places.search(search_query) if search_query
      @places = @places.group_by(&:country_name)
    end

    def search_query
      params[:query] && params[:query][:term]
    end
  end
end
