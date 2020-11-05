module Api
  module V1
    class SuitsController < Api::ApplicationController
      def index
        @suits =
          Suit
          .left_joins(:manufacturer)
          .search(params[:search])
          .then(&method(:apply_filters))
          .select(:id, :name, :kind, :manufacturer_id)
          .order('manufacturers.name, name')
          .paginate(page: current_page, per_page: rows_per_page)

        respond_to do |format|
          format.json
        end
      end

      def show
        @suit = Suit.includes(:manufacturer).find(params[:id])

        respond_to do |format|
          format.json
        end
      end

      private

      def apply_filters(relation)
        return relation if params[:ids].blank?

        relation.where(id: params[:ids])
      end

    end
  end
end
