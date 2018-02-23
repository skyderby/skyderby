module Places
  class SelectOptionsController < ApplicationController
    def index
      @places = Place.includes(:country)
                     .order('countries.name, places.name')
                     .search(search_query)
                     .group_by(&:country_name)
    end

    def search_query
      params.dig(:query, :term)
    end
  end
end
