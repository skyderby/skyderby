module Api
  module V1
    class SuitsController < Api::ApplicationController
      def index
        @suits =
          Suit
          .left_joins(:manufacturer)
          .search(params[:search])
          .then { |rel| apply_filters(rel) }
          .select(:id, :name, :kind, :manufacturer_id)
          .order('manufacturers.name, name')
          .paginate(page: current_page, per_page: rows_per_page)

        respond_to do |format|
          format.json
        end
      end

      def show
        @suit = authorize Suit.find(params[:id])

        respond_to do |format|
          format.json
        end
      end

      private

      def apply_filters(relation)
        relation
          .then { |rel| params[:ids].present? ? rel.where(id: params[:ids]) : rel }
          .then do |rel|
            if params[:manufacturer_id].present?
              rel.where(manufacturer_id: params[:manufacturer_id])
            else
              rel
            end
          end
      end
    end
  end
end
