class Api::V1::PerformanceCompetitions::RoundsController < ApplicationController
  before_action :set_event
  before_action :set_round, only: %i[update destroy]

  def index
    authorize @event, :show?

    @rounds = @event.rounds.order(:number, :created_at)
  end

  def create
    authorize @event, :update?

    @round = @event.rounds.new(create_params)

    respond_to do |format|
      if @round.save
        format.json
      else
        format.json { render json: { errors: @round.errors }, status: :unprocessable_entity }
      end
    end
  end

  def update
    authorize @event, :update?

    respond_to do |format|
      if @round.update(update_params)
        format.json
      else
        format.json { render json: { errors: @round.errors }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    authorize @event, :update?

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

  def set_round
    @round = @event.rounds.find(params[:id])
  end

  def create_params
    params.require(:round).permit(:discipline)
  end

  def update_params
    params.require(:round).permit(:completed)
  end
end
