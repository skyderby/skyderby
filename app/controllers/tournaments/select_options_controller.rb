class Tournaments::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @tournaments = policy_scope(Tournament).order(starts_at: :desc)

    @tournaments = @tournaments.search(search_query) if search_query

    @tournaments = @tournaments.page(page).per(25)

    respond_with_no_results(params[:frame_id]) if @tournaments.empty? && @tournaments.current_page == 1
  end

  def search_query
    params[:term]
  end
end
