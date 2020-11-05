module Api
  module V1
    class CountriesController < Api::ApplicationController
      def index
        @countries = Country.order(:name).then(&method(:apply_filters))
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
