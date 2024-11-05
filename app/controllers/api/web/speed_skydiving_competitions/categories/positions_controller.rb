class Api::Web::SpeedSkydivingCompetitions::Categories::PositionsController < Api::Web::ApplicationController
  before_action :set_event

  def update
    authorize @event, :update?
    category = @event.categories.find(params[:category_id])

    case direction
    when 'up'
      category.move_upper
      head :ok
    when 'down'
      category.move_lower
      head :ok
    else
      respond_with_errors(base: ['unknown direction'])
    end
  rescue ActiveRecord::RecordInvalid
    respond_with_errors category.errors
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def direction = params[:direction].to_s.downcase
end
