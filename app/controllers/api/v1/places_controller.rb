module Api
  module V1
    class PlacesController < Api::ApplicationController
      def index
        @places = Place.includes(:country)
                       .order('countries.name, places.name')
                       .search(params[:search])
                       .then { |relation| apply_filters(relation) }
                       .paginate(page: current_page, per_page: rows_per_page)
      end

      def show
        @place = authorize Place.find(params[:id])
      end

      private

      def apply_filters(relation)
        return relation if params[:ids].blank?

        relation.where(id: params[:ids])
      end
    end
  end
end
