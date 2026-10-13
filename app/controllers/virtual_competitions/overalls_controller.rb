module VirtualCompetitions
  class OverallsController < ApplicationController
    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: [{ place: :country }, :video] },
      { profile: :owner }
    ].freeze

    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      authorize @competition, :show?

      scores =
        if @competition.multi_discipline?
          @competition.multi_discipline_standings.overall
        else
          @competition.personal_top_scores.wind_cancellation(false).includes(ASSOCIATIONS)
        end
      @ranking = @competition.overall_ranking(
        scores, page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender]
      )
    end

    def self.controller_path = 'virtual_competitions'
  end
end
