module Events
  module Rounds
    class MapsController < ApplicationController
      before_action :set_event, :set_round

      def show
        authorize @event
        allowed_to_view = policy(@event).edit? || @round.completed

        return redirect_to event_path(@event) unless allowed_to_view

        respond_to do |format|
          format.html
          format.js
          format.json
        end
      end

      private

      def set_round
        @round = @event.rounds.find(params[:round_id])
      end

      def set_event
        @event = Event.find(params[:event_id])
      end
    end
  end
end
