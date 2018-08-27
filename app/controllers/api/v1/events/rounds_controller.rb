module Api
  module V1
    module Events
      class RoundsController < ApplicationController
        def index
          event = Event.find(params[:event_id])

          authorize event, :show?

          @rounds = event.rounds.order(:number, :created_at)

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
