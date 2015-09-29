class CompetitorsController < ApplicationController
  before_action :set_competitor, only: [:update, :destroy]

  load_resource :event
  before_filter :authorize_event

  load_and_authorize_resource :competitor, through: :event

  def create
    @competitor = @event.competitors.new(competitor_params)

    if @competitor.save
      @competitor
    else
      render json: @competitor.errors, status: :unprocessable_entity
    end
  end

  def update
    if @competitor.update(competitor_params)
      @competitor
    else
      render json: @competitor.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @competitor.destroy
      head :no_content
    else
      render json: @competitor.errors, status: :unprocessable_entity
    end
  end

  private

  def set_competitor
    @competitor = Competitor.find(params[:id])
  end

  def competitor_params
    params.require(:competitor).permit(
      :name,
      :profile_id,
      :profile_name,
      :wingsuit_id,
      :section_id,
      :event_id
    )
  end

  def authorize_event
    authorize! :update, @event
  end
end
