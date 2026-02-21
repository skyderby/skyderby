class PerformanceCompetitions::CategoriesController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!
  before_action :set_section, only: %i[update destroy edit move_upper move_lower]

  def create
    @section = @event.categories.new section_params

    if @section.save
      respond_with_scoreboard toast: { message: t('events.section_created'), type: 'success' }
      broadcast_scoreboards
    else
      respond_with_errors @section
    end
  end

  def update
    if @section.update section_params
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @section
    end
  end

  def destroy
    if @section.destroy
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @section
    end
  end

  def move_upper
    @section.move_upper
    if @section.errors.blank?
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @section
    end
  end

  def move_lower
    @section.move_lower
    if @section.errors.blank?
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @section
    end
  end

  def new
    @section = @event.categories.new
  end

  def edit; end

  private

  def set_section
    @section = @event.categories.find(params[:id])
  end

  def section_params
    params.require(:section).permit(:name, :event_id, :order)
  end
end
