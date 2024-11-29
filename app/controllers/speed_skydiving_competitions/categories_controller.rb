class SpeedSkydivingCompetitions::CategoriesController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  def new
    @category = @event.categories.new
  end

  def create
    @category = @event.categories.new(category_params)

    if @category.save
      broadcast_scoreboard
      render
    else
      respond_with_errors(@category)
    end
  end

  def destroy
    @category = @event.categories.find(params[:id])

    if @category.destroy
      broadcast_scoreboard
      head :no_content
    else
      respond_with_errors(@category)
    end
  end

  private

  def category_params = params.require(:category).permit(:name)
end
