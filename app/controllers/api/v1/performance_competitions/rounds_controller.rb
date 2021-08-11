class Api::V1::PerformanceCompetitions::RoundsController < ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @rounds = @event.rounds.order(:number, :created_at)
  end

  def create
    authorize @event, :update?

    @round = @event.rounds.new(round_params)

    respond_to do |format|
      if @round.save
        format.json
      else
        format.json { render json: { errors: @round.errors }, status: :unprocessable_entity }
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
        format.json { render json: { errors: @round.errors }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def round_params
    params.require(:round).permit(:discipline)
  end
end
