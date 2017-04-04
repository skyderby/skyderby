module Events
  class SelectOptionsController < ApplicationController
    def index
      @events = policy_scope(Event).order('starts_at DESC')

      @events = @events.search(search_query) if search_query
    end

    def search_query
      params[:query] && params[:query][:term]
    end
  end
end
