module Tournaments
  class CompetitorsController < ApplicationController
    include Qualifications::RespondWithScoreboard
    include CompetitorProfileParams

    before_action :authorize_tournament
    before_action :set_event
    before_action :set_tournament_competitor, only: [:edit, :update, :destroy]

    def index
      respond_with_index
    end

    def new
      @competitor = tournament.competitors.new

      respond_to do |format|
        format.turbo_stream
      end
    end

    def edit
      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      @competitor = tournament.competitors.new(tournament_competitor_params)

      if @competitor.save
        respond_with_change
      else
        respond_with_errors @competitor
      end
    end

    def update
      if @competitor.update(tournament_competitor_params)
        respond_with_change
      else
        respond_with_errors @competitor
      end
    end

    def destroy
      if @competitor.destroy
        respond_with_change
      else
        respond_with_errors @competitor
      end
    end

    private

    def respond_with_change
      broadcast_qualification_scoreboard if tournament.has_qualification
      respond_with_index
    end

    def respond_with_index
      @competitors = tournament.competitors.includes(:profile, suit: :manufacturer).order('profiles.name')
      render :index
    end

    def tournament
      @tournament ||= Tournament.find(params[:tournament_id])
    end

    def set_event
      @event = tournament
    end

    def set_tournament_competitor
      @competitor = tournament.competitors.find(params[:id])
    end

    def tournament_competitor_params
      permitted = params.require(:tournament_competitor).permit(
        :profile_id,
        :alias_id,
        :suit_id,
        :is_disqualified,
        :disqualification_reason,
        :photo,
        :sponsor_logo,
        profile_attributes: [:name, :country_id]
      )

      resolve_profile(permitted)
    end

    def authorize_tournament
      authorize tournament, :update?
    end
  end
end
