module Api
  module V1
    class CountriesController < Api::ApplicationController
      def index
        @countries =
          Country
          .order(:name)
          .then { |rel| apply_filters(rel) }
          .then { |rel| rel.search(params[:search]) }
      end

      def show
        @country = Country.find(params[:id])
      end

      private

      def apply_filters(relation)
        return relation if params[:ids].blank?

        relation.where(id: params[:ids])
      end
    end
  end
end
