module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event, only: :show

      def index
        authorize Event

        @events =
          policy_scope(EventList.all)
          .then { |rel| apply_search(rel) }
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

      def apply_search(events)
        return events if params[:term].blank?

        events.where('name ILIKE ?', "%#{params[:term]}%")
      end
    end
  end
end
