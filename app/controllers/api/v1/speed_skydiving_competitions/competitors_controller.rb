class Api::V1::SpeedSkydivingCompetitions::CompetitorsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @competitors = @event.competitors
  end

  def create
    authorize @event, :update?

    @competitor = @event.competitors.new(competitor_params)

    respond_to do |format|
      if @competitor.save
        format.json
      else
        format.json { render json: { errors: @competitor.errors }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    authorize @event, :update?

    @competitor = @event.competitors.find(params[:id])

    respond_to do |format|
      if @competitor.destroy
        format.json
      else
        format.json { render json: { errors: @competitor.errors }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def competitor_params
    params.require(:competitor).permit \
      :profile_id,
      :category_id,
      :assigned_number,
      profile_attributes: [:name, :country_id]
  end
end
