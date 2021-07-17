class Api::V1::PerformanceCompetitions::CategoriesController < ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @categories = @event.sections.ordered
  end

  def create
    authorize @event, :update?

    @category = @event.sections.new(category_params)

    respond_to do |format|
      if @category.save
        format.json
      else
        format.json { render json: { errors: @category.errors }, status: :unprocessable_entity }
      end
    end
  end

  def update
    authorize @event, :update?

    @category = @event.sections.find(params[:id])

    respond_to do |format|
      if @category.update(category_params)
        format.json
      else
        format.json { render json: { errors: @category.errors }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    authorize @event, :update?

    @category = @event.sections.find(params[:id])

    respond_to do |format|
      if @category.destroy
        format.json
      else
        format.json { render json: { errors: @category.errors }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def category_params = params.require(:category).permit(:name)
end
