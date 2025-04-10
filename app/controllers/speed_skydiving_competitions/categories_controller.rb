class SpeedSkydivingCompetitions::CategoriesController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!
  before_action :set_category, except: %i[new create]

  def new
    @category = @event.categories.new
  end

  def create
    @category = @event.categories.new(category_params)

    if @category.save
      broadcast_scoreboard
    else
      respond_with_errors @category
    end
  end

  def edit; end

  def update
    if @category.update(category_params)
      broadcast_scoreboard
    else
      respond_with_errors @category
    end
  end

  def destroy
    if @category.destroy
      broadcast_scoreboard
      head :no_content
    else
      respond_with_errors @category
    end
  end

  def move_upper
    @category.move_upper
    if @category.errors.blank?
      broadcast_scoreboard
    else
      respond_with_errors @category
    end
  end

  def move_lower
    @category.move_lower
    if @category.errors.blank?
      broadcast_scoreboard
    else
      respond_with_errors @category
    end
  end

  private

  def category_params = params.require(:category).permit(:name)

  def set_category
    @category = @event.categories.find(params[:id])
  end
end
