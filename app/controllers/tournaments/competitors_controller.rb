module Tournaments
  class CompetitorsController < ApplicationController
    before_action :authorize_tournament
    before_action :set_tournament_competitor, only: [:edit, :update, :destroy]

    def index
      respond_with_index
    end

    def new
      @competitor = tournament.competitors.new
    end

    def edit; end

    def create
      @competitor = tournament.competitors.new(tournament_competitor_params)

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
      @competitors = tournament.competitors.includes(:profile, suit: :manufacturer)
      render :index
    end

    def respond_with_errors
      render template: 'errors/ajax_errors',
             locals: { errors: @competitor.errors },
             status: :unprocessable_entity
    end

    def tournament
      @tournament ||= Tournament.find(params[:tournament_id])
    end

    def set_tournament_competitor
      @competitor = tournament.competitors.find(params[:id])
    end

    def tournament_competitor_params
      params.require(:tournament_competitor).permit(
        :tournament_id,
        :profile_id,
        :suit_id,
        :profile_mode,
        :is_disqualified,
        :disqualification_reason,
        profile_attributes: [:name, :country_id]
      )
    end

    def authorize_tournament
      authorize tournament, :update?
    end
  end
end
