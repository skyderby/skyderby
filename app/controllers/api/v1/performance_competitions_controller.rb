class Api::V1::PerformanceCompetitionsController < Api::ApplicationController
  def show
    @event = authorize Event.speed_distance_time.find(params[:id])
  end

  def create
    authorize Event
    @event = Event.new(event_params).tap do |event|
      event.responsible = Current.user
      event.wind_cancellation = true
    end

    respond_to do |format|
      if @event.save
        format.json
      else
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def event_params
    params.require(:performance_competition).permit(
      :name,
      :starts_at,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :visibility,
      :use_teams
    )
  end
end
