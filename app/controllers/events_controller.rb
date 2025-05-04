class EventsController < ApplicationController
  include EventScoped

  before_action :set_event, only: %i[edit update destroy]
  etag { display_event_params if action_name == 'show' }

  def index
    authorize Event

    rows_per_page = request.variant.include?(:mobile) ? 5 : 10

    @events =
      policy_scope(EventList.all)
      .includes(place: :country)
      .by_activity(index_params[:kind])
      .search(index_params[:query])
      .paginate(page:, per_page: rows_per_page)

    fresh_when @events

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    authorize Event
  end

  def create
    authorize Event

    @event = Event.new event_params
    @event.responsible = current_user
    if @event.save
      respond_to do |format|
        format.html { redirect_to @event }
        format.js
      end
    else
      redirect_to events_path
    end
  end

  def edit
    authorize @event

    respond_to do |format|
      format.html
    end
  end

  def update
    authorize @event

    if @event.update update_event_params
      redirect_to event_path(@event)
    else
      respond_with_errors(@event.errors)
    end
  end

  def show
    load_event(params[:id])

    authorize @event

    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))

    fresh_when @event

    respond_to do |format|
      format.html
      format.js
    end
  end

  def destroy
    authorize @event
  end

  private

  def index_params
    params.permit(:kind, :query)
  end
  helper_method :index_params

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params.require(:event).permit(
      :name,
      :starts_at,
      :rules,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :wind_cancellation,
      :visibility,
      :number_of_results_for_total,
      :use_teams
    )
  end

  def update_event_params
    event_params.tap do |all_params|
      all_params.delete(:rules) if @event.rounds.any?
    end
  end
end
