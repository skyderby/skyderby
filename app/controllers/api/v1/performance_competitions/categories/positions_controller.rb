class Api::V1::PerformanceCompetitions::Categories::PositionsController < Api::ApplicationController
  before_action :set_event

  def update
    authorize @event, :update?

    category = @event.sections.find(params[:category_id])

    respond_to do |format|
      case direction
      when 'up'
        category.move_upper
        format.json { head :ok }
      when 'down'
        category.move_lower
        format.json { head :ok }
      else
        format.json { render json: { errors: ['unknown direction'] }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def direction = params[:direction].to_s.downcase
end
