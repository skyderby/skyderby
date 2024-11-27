class SpeedSkydivingCompetitions::CategoriesController < ApplicationController
  before_action :set_event

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

  def broadcast_scoreboard
    Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :editable,
                                               target: 'scoreboard',
                                               partial: 'speed_skydiving_competitions/scoreboard',
                                               locals: { event: @event, editable: true }

    Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :read_only,
                                               target: 'scoreboard',
                                               partial: 'speed_skydiving_competitions/scoreboard',
                                               locals: { event: @event, editable: false }
  end

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end
end
