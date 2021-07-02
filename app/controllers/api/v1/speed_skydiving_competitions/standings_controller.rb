class Api::V1::SpeedSkydivingCompetitions::StandingsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @standings = SpeedSkydivingCompetition::Scoreboard.new(@event)
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end
end
