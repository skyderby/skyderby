module Events
  module Rounds
    class MapsController < ApplicationController
      before_action :set_round, :load_event

      def show
        @round_map = Map.new(@round)
      end

      private

      def set_round
        @round = Round.includes(event_tracks: [:track, { competitor: :profile }])
                      .find(params[:round_id])
      end

      def load_event
        @event = Event.includes(sections: { competitors: :profile })
                      .find(params[:event_id])
      end
    end
  end
end
