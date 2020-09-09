module Api
  module V1
    module Suits
      class StatsController < ApplicationController
        def show
          authorize Suit, :index?

          @stats =
            if requested_ids.empty?
              []
            else
              Suit.stats.where(id: requested_ids)
            end
        end

        private

        def requested_ids
          stats_params[:ids] || []
        end

        def stats_params
          params.permit(ids: [])
        end
      end
    end
  end
end
