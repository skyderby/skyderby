module Api
  class EventsController < ApplicationController
    before_action :set_event, only: [:update]

    def update
      authorize! :update, @event

      if @event.update event_params
        @event
      else
        render json: @event.errors, status: :unprocessable_entity
      end
    end

    private

    def set_event
      @event = Event.find(params[:id])
    end

    def event_params
      params.require(:event).permit(
        :name, 
        :range_from, 
        :range_to, 
        :status, 
        :place_id
      )
    end
  end
end
