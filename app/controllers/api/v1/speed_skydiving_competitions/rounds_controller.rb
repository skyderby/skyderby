class Api::V1::SpeedSkydivingCompetitions::RoundsController < Api::ApplicationController
  before_action :set_event
  before_action :set_round, only: %i[update destroy]

  def index
    authorize @event, :show?

    @rounds = @event.rounds.ordered
  end

  def create
    authorize @event, :update?

    @round = @event.rounds.new

    respond_to do |format|
      if @round.save
        format.json
      else
        format.json { respond_with_errors @round.errors }
      end
    end
  end

  def update
    authorize @event, :update?

    respond_to do |format|
      if @round.update(round_params)
        format.json
      else
        format.json { respond_with_errors @round.errors }
      end
    end
  end

  def destroy
    authorize @event, :update?

    respond_to do |format|
      if @round.destroy
        format.json
      else
        format.json { respond_with_errors @round.errors }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def set_round
    @round = @event.rounds.find(params[:id])
  end

  def round_params
    params.require(:round).permit(:completed)
  end
end
