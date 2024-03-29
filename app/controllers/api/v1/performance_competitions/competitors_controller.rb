class Api::V1::PerformanceCompetitions::CompetitorsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @competitors = @event.competitors.includes(:suit, profile: :country)
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

  def update
    authorize @event, :update?

    @competitor = @event.competitors.find(params[:id])

    respond_to do |format|
      if @competitor.update(competitor_params)
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
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def competitor_params
    permitted_params = [
      :profile_id,
      :category_id,
      :suit_id,
      :assigned_number,
      { profile_attributes: [:name, :country_id] }
    ]

    params.require(:competitor).permit(permitted_params).tap do |attrs|
      attrs[:profile_attributes][:owner] = @event if attrs[:profile_attributes].present?
      attrs[:section_id] = attrs.delete(:category_id)
    end
  end
end
