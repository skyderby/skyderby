module Places
  class SelectOptionsController < ApplicationController
    def index
      @places = Place.includes(:country)
                     .order('countries.name, places.name')

      @places = @places.search(search_query) if search_query
      @places = @places.group_by(&:country_name)
    end

    def search_query
      params[:query] && params[:query][:term]
    end
  end
end
