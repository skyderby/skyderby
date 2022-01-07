class Api::V1::SpeedSkydivingCompetitions::CompetitorsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @competitors = @event.competitors.includes(profile: :country)
  end

  def create
    authorize @event, :update?

    @competitor = @event.competitors.new(competitor_params)

    respond_to do |format|
      if @competitor.save
        format.json
      else
        format.json { respond_with_errors @competitor.errors }
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
        format.json { respond_with_errors @competitor.errors }
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
        format.json { respond_with_errors @competitor.errors }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def competitor_params
    permitted_params = [
      :profile_id,
      :category_id,
      :assigned_number,
      { profile_attributes: [:name, :country_id] }
    ]

    params.require(:competitor).permit(permitted_params).tap do |attrs|
      attrs[:profile_attributes][:owner] = @event if attrs[:profile_attributes].present?
    end
  end
end
