class PerformanceCompetitions::SelectOptionsController < ApplicationController
  def index
    @events = PerformanceCompetition.listable.order('starts_at DESC')

    @events = @events.search(search_query) if search_query
  end

  def search_query
    params[:query] && params[:query][:term]
  end
end
