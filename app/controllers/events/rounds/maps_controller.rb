module Events
  module Rounds
    class MapsController < ApplicationController
      before_action :set_event, :set_round

      def show
        authorize @event
        @round_map = Map.new(@round)
      end

      private

      def set_round
        @round = @event
          .rounds
          .includes(event_tracks: [:track, { competitor: :profile }])
          .find(params[:round_id])
      end

      def set_event
        @event ||= Event.find(params[:event_id])
      end
    end
  end
end
