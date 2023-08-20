class Api::V1::PerformanceCompetitionsController < Api::ApplicationController
  def index
    authorize Event

    @events =
      policy_scope(Event.speed_distance_time)
      .order(starts_at: :desc)
      .then { |relation| relation.search(params[:search]) }
      .paginate(page: current_page, per_page: rows_per_page)
  end

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
        format.json { respond_with_errors(@event.errors) }
      end
    end
  end

  def update
    @event = authorize Event.speed_distance_time.find(params[:id])

    respond_to do |format|
      if @event.update(event_params)
        format.json
      else
        format.json { respond_with_errors(@event.errors) }
      end
    end
  end

  private

  def event_params
    params.require(:performance_competition).permit \
      :name,
      :starts_at,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :visibility,
      :use_teams
  end
end
