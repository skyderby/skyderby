module Api
  module V1
    class VirtualCompetitionsController < ApplicationController
      def index
        @competitions = VirtualCompetition.all
      end

      def show
        @competition = VirtualCompetition.find(params[:id])
      end
    end
  end
end
