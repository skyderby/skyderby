module Api
  module V1
    class VirtualCompetitionsController < ApplicationController
      before_action :set_competition, only: [:show]

      def index
        @competitions = VirtualCompetition.all
      end

      def show
      end

      private

      def set_competition
        @competition = VirtualCompetition.find(params[:id])
      end
    end
  end
end
