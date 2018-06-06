class EventsController < ApplicationController
  include EventScoped

  before_action :set_event, only: %i[edit update destroy]

  def index
    authorize Event

    rows_per_page = request.variant.include?(:mobile) ? 5 : 10

    @events =
      policy_scope(EventList.all)
      .includes(event: { place: :country })
      .paginate(page: params[:page], per_page: rows_per_page)

    fresh_when etags_for(@events)
  end

  def new
    authorize Event
    @event = Event.new
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
  end

  def update
    authorize @event

    if @event.update event_params
      if @event.previous_changes.key?(:wind_cancellation) || @event.previous_changes.key?(:status)
        redirect_to event_path(@event)
      else
        @event
      end
    else
      respond_with_errors(@event.errors)
    end
  end

  def show
    load_event(params[:id])

    authorize @event

    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))

    fresh_when etags_for(@event), last_modified: @event.updated_at
  end

  def destroy
    authorize @event
  end

  private

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
      :number_of_results_for_total
    )
  end
end
