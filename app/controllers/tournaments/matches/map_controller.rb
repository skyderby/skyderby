class Tournaments::Matches::MapController < ApplicationController
  before_action :set_match
  load_resource :tournament

  def index
  end

  private

  def set_match
    @match = TournamentMatch.find(params[:match_id])
  end
end
