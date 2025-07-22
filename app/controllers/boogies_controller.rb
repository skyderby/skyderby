class BoogiesController < ApplicationController
  include BoogieContext

  before_action :set_event, except: %i[new create]
  before_action :authorize_event_access!, except: %i[new create]

  def new
    respond_not_authorized unless Boogie.creatable?
    @event = Boogie.new
  end

  def create
    respond_not_authorized unless Boogie.creatable?

    @event = Boogie.new event_params
    @event.responsible = current_user
    if @event.save
      redirect_to @event
    else
      redirect_to events_path
    end
  end

  def show; end

  def edit
    respond_not_authorized unless @event.editable?
  end

  def update
    respond_not_authorized unless @event.editable?

    if @event.update event_params
      broadcast_scoreboards if @event.saved_change_to_status?

      redirect_to boogie_path(@event)
    else
      respond_with_errors(@event.errors)
    end
  end

  private

  def set_event
    @event = Boogie.find(params[:id])
  end

  def event_params
    params.require(:boogie).permit(
      :name,
      :starts_at,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :visibility,
      :number_of_results_for_total
    )
  end
end
