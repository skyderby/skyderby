module Events
  class TeamsController < ApplicationController
    def show
      @event = Event.find(params[:event_id])

      authorize @event
    end
  end
end
