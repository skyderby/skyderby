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

        respond_to do |format|
          format.json
        end
      end
    end
  end
end
