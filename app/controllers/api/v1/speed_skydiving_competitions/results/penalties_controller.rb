class Api::V1::SpeedSkydivingCompetitions::Results::PenaltiesController < Api::ApplicationController
  before_action :set_event

  def update
    authorize @event, :update?

    @result = @event.results.find(params[:result_id])
    @result.transaction do
      @result.penalties.clear
      @result.penalties_attributes = penalties_params[:penalties_attributes]
      @result.save!
    end
  rescue ActiveRecord::RecordInvalid
    respond_with_errors @result.errors
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def penalties_params
    params.permit(penalties_attributes: [:percent, :reason])
  end
end
