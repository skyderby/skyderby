module Countries
  class SelectOptionsController < ApplicationController
    def index
      @countries = Country.order(:name)
                          .search(search_query)
                          .paginate(page:, per_page: 25)
    end

    def search_query
      params[:term]
    end
  end
end
