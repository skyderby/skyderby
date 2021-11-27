module Api
  module V1
    class VideosController < ApplicationController
      def index
        authorize Track::Video

        @videos =
          policy_scope(Track::Video.left_joins(:track).order('tracks.recorded_at desc'))
          .then { |rel| apply_filter(rel) }
          .then { |rel| rel.paginate(page: current_page, per_page: rows_per_page) }
      end

      private

      def apply_filter(rel)
        return rel unless params[:place_id]

        rel.by_place(params[:place_id])
      end

      def index_params
        params.permit(place_id: [])
      end
    end
  end
end
