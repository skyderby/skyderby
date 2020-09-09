module Api
  module V1
    module Suits
      class PopularitiesController < ApplicationController
        def show
          authorize Suit, :index?

          @suits = Suit.popularity(
            popularity_params.fetch(:period_from, 1.year.ago),
            popularity_params.fetch(:period_to, Date.current),
            popularity_params[:activity]
          )
        end

        private

        def popularity_params
          params.permit(:period_from, :period_to, :activity)
        end
      end
    end
  end
end
