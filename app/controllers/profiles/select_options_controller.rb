module Profiles
  class SelectOptionsController < ApplicationController
    def index
      @profiles = Profile.order(:name)

      @profiles = @profiles.joins(:user) if only_registered?
      @profiles = @profiles.search(search_query) if search_query
    end

    private

    def search_query
      params[:query] && params[:query][:term]
    end

    def only_registered?
      params[:query] && params[:query][:only_registered]
    end
  end
end
