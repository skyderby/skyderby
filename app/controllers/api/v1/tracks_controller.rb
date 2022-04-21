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

      def create
        authorize Track

        @track = CreateTrackService.call(
          create_params.merge(owner: (current_user if current_user.registered?)),
          segment: params[:segment]
        )

        current_user.tracks << @track.id unless current_user.registered?
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
        TrackOrder.new(index_params[:sort_by]).apply(collection)
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
          :sort_by,
          :profile_id,
          :suit_id,
          :place_id,
          :kind,
          :term,
          :year,
          year: [],
          profile_id: [],
          suit_id: [],
          place_id: []
      end

      def create_params
        params.require(:track).permit \
          :name,
          :kind,
          :visibility,
          :location,
          :place_id,
          :suit_id,
          :missing_suit_name,
          :comment,
          :track_file_id
      end

      def update_params
        params.require(:track).permit(
          :kind,
          :location,
          :place_id,
          :missing_suit_name,
          :suit_id,
          :comment,
          :visibility,
          :disqualified_from_online_competitions,
          jump_range: [:from, :to]
        ).then(&method(:process_jump_range))
      end

      def process_jump_range(permitted_params)
        return permitted_params unless permitted_params.key? :jump_range

        permitted_params
          .merge(
            ff_start: permitted_params.dig(:jump_range, :from),
            ff_end: permitted_params.dig(:jump_range, :to)
          )
          .except(:jump_range)
      end
    end
  end
end
