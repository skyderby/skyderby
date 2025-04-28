class PerformanceCompetitions::SelectOptionsController < ApplicationController
  def index
    @events = policy_scope(PerformanceCompetition).order('starts_at DESC')

    @events = @events.search(search_query) if search_query.present?
  end

  def search_query = params[:term]
end
