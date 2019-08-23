module Api
  module V1
    module Events
      class RoundsController < Api::ApplicationController
        before_action :set_event

        def show
          authorize @event, :show?

          @round = ::Events::Rounds::Show.new(@event, params[:id])

          respond_to do |format|
            format.json
          end
        end

        def index
          authorize @event, :show?

          @rounds = @event.rounds.order(:number, :created_at)

          respond_to do |format|
            format.json
          end
        end

        private

        def set_event
          @event = Event.find(params[:event_id])
        end
      end
    end
  end
end
