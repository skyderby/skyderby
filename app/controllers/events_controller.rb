class EventsController < ApplicationController
  include EventScoped

  before_action :set_event, only: %i[edit update destroy]

  def index
    authorize Event

    @events =
      policy_scope(EventList.all)
      .includes(event: { place: :country })
      .paginate(page: params[:page], per_page: 20)
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

    @scoreboard = Events::ScoreboardFactory.new(@event, @display_raw_results).create
  end

  def destroy
    authorize @event
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def show_params
    params.permit(:display_raw_results)
  end
  helper_method :show_params

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
