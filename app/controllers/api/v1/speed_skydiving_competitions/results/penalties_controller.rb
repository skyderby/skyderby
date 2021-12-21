class Api::V1::SpeedSkydivingCompetitions::Results::PenaltiesController < Api::ApplicationController
  before_action :set_event

  def update
    authorize @event, :update?

    @result = @event.results.find(params[:result_id])
    @result.transaction do
      @result.penalties.clear
      @result.penalties_attributes = penalties_params[:penalties_attributes]
    end

    respond_to do |format|
      if @result.save
        format.json
      else
        format.json { render json: @result.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def penalties_params
    params.permit(penalties_attributes: [:percent, :reason])
  end
end
