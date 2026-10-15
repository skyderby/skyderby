module VirtualCompetitions
  class FavoritesController < ApplicationController
    before_action :set_competition
    before_action :require_registered_user

    def create
      @competition.favorite(user: Current.user)
      render_button
    end

    def destroy
      @competition.unfavorite(user: Current.user)
      render_button
    end

    private

    def set_competition
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      respond_not_authorized unless policy(@competition).show?
    end

    def require_registered_user
      redirect_to new_user_session_path unless Current.user.registered?
    end

    def render_button
      render turbo_stream: turbo_stream.replace(
        helpers.dom_id(@competition, :favorite),
        partial: 'virtual_competitions/favorites/button',
        locals: { competition: @competition }
      )
    end
  end
end
