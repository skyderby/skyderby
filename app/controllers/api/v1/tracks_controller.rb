module Api
  module V1
    class TracksController < Api::ApplicationController
      def index
        authorize Track

        @tracks = policy_scope(Track.all)
          .then(&method(:apply_filter))
          .then(&method(:apply_sort))
          .then(&method(:preload_associations))
          .then(&method(:paginate))
      end

      private

      def apply_filter(collection)
        TrackFilter.new(index_params).apply(collection)
      end

      def apply_sort(collection)
        TrackOrder.new(index_params[:order]).apply(collection)
      end

      def preload_associations(collection)
        collection
          .left_outer_joins(:time, :distance, :speed)
          .includes \
            :video,
            :pilot,
            :distance,
            :speed,
            :time,
            place: [:country],
            suit: [:manufacturer]
      end

      def paginate(collection)
        collection.paginate(page: current_page, per_page: rows_per_page)
      end

      def index_params
        params.permit \
          :per_page,
          :page,
          :order,
          :profile_id,
          :suit_id,
          :place_id,
          :kind,
          :term
      end
    end
  end
end
