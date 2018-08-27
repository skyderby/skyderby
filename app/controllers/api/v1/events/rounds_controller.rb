module Api
  module V1
    module Events
      class RoundsController < ApplicationController
        def index
          event = Event.find(params[:event_id])

          authorize event, :show?

          @rounds = event.rounds

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
