module Countries
  class SelectOptionsController < ApplicationController
    def index
      @countries = Country.order(:name)

      @countries = @countries.search(search_query) if search_query
    end

    def search_query
      params[:query] && params[:query][:term]
    end
  end
end
