class PerformanceCompetitions::CategoriesController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :authorize_event_update!
  before_action :set_category, only: %i[update destroy edit move_upper move_lower]

  def create
    @category = @event.sections.new section_params

    if @category.save
      broadcast_scoreboard
    else
      respond_with_errors @category
    end
  end

  def update
    if @category.update section_params
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

  def new
    @category = @event.sections.new
  end

  def edit; end

  private

  def set_category
    @category = @event.sections.find(params[:id])
  end

  def section_params
    params.require(:category).permit(:name, :event_id, :order)
  end
end
