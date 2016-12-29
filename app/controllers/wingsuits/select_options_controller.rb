module Wingsuits
  class SelectOptionsController < ApplicationController
    def index
      @suits = Wingsuit.includes(:manufacturer)
                       .order('manufacturers.name, wingsuits.name')

      @suits = @suits.search(search_query) if search_query
      @suits = @suits.group_by(&:manufacturer_name)
    end

    def search_query
      params[:query] && params[:query][:term]
    end
  end
end
