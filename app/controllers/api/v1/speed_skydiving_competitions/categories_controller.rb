class Api::V1::SpeedSkydivingCompetitions::CategoriesController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @categories = @event.categories
  end

  def create
    authorize @event, :update?

    @category = @event.categories.new(category_params)

    respond_to do |format|
      if @category.save
        format.json
      else
        format.json { { errors: @category.errors } }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def category_params
    params.require(:category).permit(:name)
  end
end
