class PerformanceCompetitions::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @events = PerformanceCompetition.listable.order('starts_at DESC').page(page).per(25)

    @events = @events.search(search_query) if search_query

    respond_with_no_results(params[:frame_id]) if @events.empty? && @events.current_page == 1
  end

  def search_query
    params[:query] && params[:query][:term]
  end
end
