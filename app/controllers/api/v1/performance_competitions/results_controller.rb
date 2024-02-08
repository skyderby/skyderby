class Api::V1::PerformanceCompetitions::ResultsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @results =
      if policy(@event).update?
        @event.results
      elsif !@event.surprise?
        @event.results.where(round: @event.rounds.completed)
      else
        Event::Result.none
      end
  end

  def update
    authorize @event, :update?

    @result = @event.results.find(params[:id])

    @result.transaction do
      @result.track.update!(update_params[:track_attributes])
      @result.calculate_result
      @result.save!
    end

    respond_to do |format|
      format.json
    end
  end

  def destroy
    authorize @event, :update?

    @result = @event.results.find(params[:id])

    respond_to do |format|
      if @result.destroy
        format.json
      else
        format.json { respond_with_errors @result.errors }
      end
    end
  end

  private

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def update_params
    params.require(:result).permit(track_attributes: [:ff_start, :ff_end])
  end
end
