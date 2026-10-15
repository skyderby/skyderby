module Api
  module V1
    module VirtualCompetitions
      class FavoritesController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :require_registered_user!
        before_action :set_competition

        def create
          @competition.favorite(user: current_user)
          render json: { favorite: true }
        end

        def destroy
          @competition.unfavorite(user: current_user)
          render json: { favorite: false }
        end

        private

        def set_competition
          @competition = VirtualCompetition.find(params[:virtual_competition_id])
          render_errors(['Not found'], status: :not_found) unless @competition.viewable?(current_user)
        end
      end
    end
  end
end
