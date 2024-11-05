class Api::Web::SpeedSkydivingCompetitions::OpenStandingsController < Api::Web::ApplicationController
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
