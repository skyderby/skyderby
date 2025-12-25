class Tournaments::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @tournaments = policy_scope(Tournament).order('starts_at DESC')

    @tournaments = @tournaments.search(search_query) if search_query

    respond_with_no_results(params[:frame_id]) if @tournaments.empty?
  end

  def search_query
    params[:query] && params[:query][:term]
  end
end
