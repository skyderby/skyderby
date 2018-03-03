module Suits
  class SelectOptionsController < ApplicationController
    def index
      @suits = Suit.includes(:manufacturer)
                   .order('manufacturers.name, suits.name')
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
