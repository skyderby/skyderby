class Tournaments::SelectOptionsController < ApplicationController
  layout false

  def index
    @tournaments = policy_scope(Tournament).order('starts_at DESC')

    @tournaments = @tournaments.search(search_query) if search_query
  end

  def search_query
    params[:query] && params[:query][:term]
  end
end
