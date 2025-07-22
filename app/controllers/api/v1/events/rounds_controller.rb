class Api::V1::Events::RoundsController < Api::ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show
    @round = ::Events::Rounds::Show.new(@event, params[:id])

    respond_to do |format|
      format.json
    end
  end

  def index
    @rounds = @event.rounds.order(:number, :created_at)

    respond_to do |format|
      format.json
    end
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:event_id])
  end
end
