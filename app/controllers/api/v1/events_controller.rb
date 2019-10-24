module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event

      def show
        authorize @event
      end

      private

      def set_event
        @event = Event.find(params[:id])
      end
    end
  end
end
