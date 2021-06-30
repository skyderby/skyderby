class Api::V1::SpeedSkydivingCompetitions::CompetitorsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @competitors = @event.competitors
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end
end
