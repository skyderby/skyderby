module Countries
  class SelectOptionsController < ApplicationController
    def index
      @countries = Country.order(:name)
                          .search(search_query)
                          .paginate(page: page, per_page: 25)
    end

    def search_query
      params[:term]
    end

    def page
      params[:page]
    end
  end
end
