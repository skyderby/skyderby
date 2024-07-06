module Api
  module V1
    class EventsController < ApplicationController
      def index
        authorize Event

        @events =
          policy_scope(EventList.all)
          .then { |rel| apply_search(rel) }
          .includes(:place)
          .paginate(page: current_page, per_page: rows_per_page)
      end

      private

      def apply_search(events)
        return events if params[:term].blank?

        events.where('name ILIKE ?', "%#{params[:term]}%")
      end
    end
  end
end
