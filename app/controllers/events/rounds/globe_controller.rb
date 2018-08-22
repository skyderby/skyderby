module Events
  module Rounds
    class GlobeController < ApplicationController
      before_action :load_event, :set_round

      def show
        @round_map = Globe.new(@round)
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
