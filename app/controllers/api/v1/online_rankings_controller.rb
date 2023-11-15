module Api
  module V1
    class OnlineRankingsController < ApplicationController
      def index
        authorize VirtualCompetition

        @online_rankings = VirtualCompetition.includes(:group, place: :country)
      end

      def show
        authorize VirtualCompetition

        @online_ranking = VirtualCompetition.find(params[:id])
      end
    end
  end
end
