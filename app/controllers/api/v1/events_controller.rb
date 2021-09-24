module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event, only: :show

      def index
        authorize Event

        @events =
          policy_scope(EventList.all)
          .includes(:place)
          .paginate(page: current_page, per_page: rows_per_page)
      end

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
