module Api
  class EventsController < ApplicationController

    before_action :set_event, :only => [:update]

    def update
      respond_to do |format|
        if @event.update event_params
          format.json { render json: @event.details.to_json, status: :ok}
        else
          format.json { render json: @event.errors, status: :unprocessable_entity }
        end
      end
    end

    private

    def set_event
      @event = Event.find(params[:id])
    end

    def event_params
      params.require(:event).permit(:name, :range_from, :range_to, :status)
    end

  end
end
