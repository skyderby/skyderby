module Places
  class SelectOptionsController < ApplicationController
    def index
      @places = Place.includes(:country)
                     .order('countries.name, places.name')
                     .search(search_query)
                     .paginate(page:, per_page: 25)
    end

    def search_query
      params[:term]
    end
  end
end
