class Events::EventOrganizersController < ApplicationController

  load_resource :event
  before_filter :authorize_event

  before_action :set_event_organizer, only: [:destroy]

  load_and_authorize_resource :event_organizer, through: :event

  def create
    @event_organizer = @event.event_organizers.new event_organizer_params

    if @event_organizer.save
      @event_organizer
    else
      respond_to do |format|
        format.js { render 'errors/ajax_errors', locals: {errors: @event_organizer.errors} }
        format.json { render json: @event_rganizer.errors, status: :unprocessible_entry }
      end
    end
  end

  def destroy
    if @event_organizer.destroy
      respond_to do |format|
        format.js 
        format.json { head :no_content }
      end
    else
      respond_to do |format|
        format.js { render 'errors/ajax_errors', locals: {errors: @event_organizer.errors} }
        format.json { render json: @event_rganizer.errors, status: :unprocessible_entry }
      end
    end
  end

  def new
    @event_organizer = @event.event_organizers.new
  end

  private

  def set_event_organizer
    @event_organizer = @event.event_organizers.find(params[:id])
  end

  def event_organizer_params
    params.require(:event_organizer).permit(:event_id, :profile_id)
  end

  def authorize_event
    authorize! :update, @event
  end
end
