module Profiles
  class SelectOptionsController < ApplicationController
    def index
      @profiles = Profile.search(search_query)
                         .order(:name)
                         .paginate(page: page, per_page: 25)
    end

    private

    def search_query
      params[:term]
    end

    def page
      params[:page]
    end
  end
end
