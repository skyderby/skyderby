module Api
  module V1
    class SuitsController < Api::ApplicationController
      def index
        @suits =
          Suit
          .left_joins(:manufacturer)
          .select(
            :id,
            :name,
            :kind,
            'manufacturers.name AS make',
            'manufacturers.code AS make_code'
          )
          .order('manufacturers.name, name')
        @suits = @suits.joins(:exit_performance) if ActiveModel::Type::Boolean.new.cast(params[:with_exit_performance])

        respond_to do |format|
          format.json
        end
      end

      def show
        @suit = Suit.includes(:manufacturer, :exit_performance).find(params[:id])
      end
    end
  end
end
