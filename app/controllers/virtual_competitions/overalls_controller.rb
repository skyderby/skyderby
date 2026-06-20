module VirtualCompetitions
  class OverallsController < ApplicationController
    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: [{ place: :country }, :video] },
      { profile: :owner }
    ].freeze

    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])

      scores = @competition.personal_top_scores.wind_cancellation(false).includes(ASSOCIATIONS)
      @ranking = @competition.overall_ranking(scores, page: params[:page], jump_kind: params[:jump_kind])
    end

    def self.controller_path = 'virtual_competitions'
  end
end
