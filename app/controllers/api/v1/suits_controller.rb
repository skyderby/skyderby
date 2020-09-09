module Api
  module V1
    class SuitsController < Api::ApplicationController
      def index
        @suits =
          Suit
          .left_joins(:manufacturer)
          .search(params[:search])
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
    end
  end
end
