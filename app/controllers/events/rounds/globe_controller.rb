module Events
  module Rounds
    class GlobeController < ApplicationController
      before_action :load_event, :set_round

      def show
        @round_map = Globe.new(@round)

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
        @round = @event.rounds.includes(results: [:track, { competitor: :profile }])
                       .find(params[:round_id])
      end

      def load_event
        @event = Event.includes(sections: { competitors: :profile })
                      .find(params[:event_id])
      end
    end
  end
end
