class PerformanceCompetitions::SelectOptionsController < ApplicationController
  layout false

  def index
    @events = PerformanceCompetition.listable.order('starts_at DESC').paginate(page:, per_page: 25)

    @events = @events.search(search_query) if search_query
  end

  def search_query
    params[:query] && params[:query][:term]
  end
end
