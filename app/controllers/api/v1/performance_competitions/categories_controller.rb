class Api::V1::PerformanceCompetitions::CategoriesController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  before_action :set_category, only: %i[update destroy]

  def create
    @category = @event.categories.new(category_params)

    if @category.save
      broadcast_scoreboards
      render :show, status: :created
    else
      render_record_errors @category
    end
  end

  def update
    if @category.update(category_params)
      broadcast_scoreboards
      render :show
    else
      render_record_errors @category
    end
  end

  def destroy
    if @category.destroy
      broadcast_scoreboards
      head :no_content
    else
      render_record_errors @category
    end
  end

  private

  def set_category
    @category = @event.categories.find(params[:id])
  end

  def category_params = params.require(:category).permit(:name)
end
