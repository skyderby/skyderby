module Api
  module V1
    class OnlineRankingsController < ApplicationController
      def index
        authorize VirtualCompetition

        @online_rankings = VirtualCompetition.includes(:group, place: :country)
      end
    end
  end
end
