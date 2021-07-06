class Api::V1::SpeedSkydivingCompetitions::TeamStandingsController < Api::ApplicationController
  before_action :set_event

  def show
    authorize @event, :show?

    @standings = SpeedSkydivingCompetition::TeamStandings.new(@event)
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end
end
