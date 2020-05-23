module Api
  module V1
    class TracksController < Api::ApplicationController
      before_action :set_track, only: %i[show update destroy]

      def index
        authorize Track

        @tracks =
          policy_scope(Track.all)
          .then(&method(:apply_filter))
          .then(&method(:apply_sort))
          .then(&method(:preload_associations))
          .then(&method(:paginate))
      end

      def show
        authorize @track
      end

      def update
        authorize @track

        respond_to do |format|
          if @track.update(update_params)
            format.json
          else
            format.json do
              render json: { errors: @track.errors }, status: :unprocessable_entity
            end
          end
        end
      end

      def destroy
        authorize @track

        if @track.destroy
          head :no_content
        else
          render json: { errors: @track.errors }, status: :unprocessable_entity
        end
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

      def set_track
        @track = Track.includes(:video).find(params[:id])
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

      def update_params
        params.require(:track).permit \
          :kind,
          :location,
          :place_id,
          :ground_level,
          :jump_range,
          :missing_suit_name,
          :suit_id,
          :comment,
          :visibility,
          :disqualified_from_online_competitions
      end
    end
  end
end
