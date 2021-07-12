class Api::V1::SpeedSkydivingCompetitions::OpenStandingsController < Api::ApplicationController
  before_action :set_event

  def show
    authorize @event, :show?

    @scoreboard = SpeedSkydivingCompetition::OpenScoreboard.new(@event)
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end
end
