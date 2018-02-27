module Profiles
  class SelectOptionsController < ApplicationController
    def index
      @profiles = Profile.search(search_query).order(:name)
    end

    private

    def search_query
      params.dig(:query, :term)
    end
  end
end
