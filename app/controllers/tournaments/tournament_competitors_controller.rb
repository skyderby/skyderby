module Tournaments
  class TournamentCompetitorsController < ApplicationController
    before_action :set_tournament_competitor, only: [:edit, :update, :destroy]

    load_resource :tournament
    before_action :authorize_tournament

    def index
      respond_with_index
    end

    def new
      @competitor = @tournament.competitors.new
    end

    def edit; end

    def create
      @competitor = @tournament.competitors.new(tournament_competitor_params)

      if @competitor.save
        respond_with_index
      else
        respond_to do |format|
          format.html { render action: 'new' }
          format.js { respond_with_errors }
        end
      end
    end

    def update
      if @competitor.update(tournament_competitor_params)
        respond_with_index
      else
        respond_with_errors
      end
    end

    def destroy
      if @competitor.destroy
        respond_with_index
      else
        respond_with_errors
      end
    end

    private

    def respond_with_index
      @competitors = @tournament.competitors.includes(:profile, wingsuit: :manufacturer)
      render :index
    end

    def respond_with_errors
      render template: 'errors/ajax_errors',
        locals: { errors: @competitor.errors },
        status: :unprocessable_entity
    end

    def set_tournament_competitor
      @competitor = TournamentCompetitor.find(params[:id])
    end

    def tournament_competitor_params
      params.require(:tournament_competitor).permit(
        :tournament_id,
        :profile_id,
        :wingsuit_id,
        :profile_mode,
        profile_attributes: [:name, :country_id]
      )
    end

    def authorize_tournament
      authorize! :edit, @tournament
    end
  end
end
