class Api::V1::TournamentsController < Api::ApplicationController
  before_action :set_tournament, only: %i[show]

  def show
    authorize @tournament
  end

  private

  def set_tournament
    @tournament = Tournament.find(params[:id])
  end
end
