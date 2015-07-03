class TournamentsController < ApplicationController
  before_action :set_tournament

  def show
  end

  private

  def set_tournament
    @tournament = Tournament.find(params[:id])
  end
end
