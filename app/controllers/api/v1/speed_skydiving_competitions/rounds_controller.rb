class Api::V1::SpeedSkydivingCompetitions::RoundsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @rounds = @event.rounds
  end

  def create
    authorize @event, :update?

    @round = @event.rounds.new

    respond_to do |format|
      if @round.save
        format.json
      else
        format.json { { errors: @round.errors } }
      end
    end
  end

  def destroy
    authorize @event, :update?

    @round = @event.rounds.find(params[:id])

    respond_to do |format|
      if @round.destroy
        format.json
      else
        format.json { { errors: @round.errors } }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end
end
