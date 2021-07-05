class Api::V1::SpeedSkydivingCompetitions::ResultsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @results = @event.results
  end

  def create
    authorize @event, :update?

    @result = @event.results.new(result_params)

    respond_to do |format|
      if @result.save
        format.json
      else
        format.json { render json: { errors: @result.errors }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    authorize @event, :update?

    @result = @event.results.find(params[:id])

    respond_to do |format|
      if @result.destroy
        format.json
      else
        format.json { render json: { errors: @result.errors }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def result_params
    params.require(:result).permit \
      :round_id,
      :competitor_id,
      :track_from,
      :track_id,
      track_attributes: [:file]
  end
end
