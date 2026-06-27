module VirtualCompetitions
  class YearController < ApplicationController
    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: [{ place: :country }, :video] },
      { profile: :owner }
    ].freeze

    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      return redirect_to virtual_competition_path(@competition) unless @competition.annual?

      year = params[:year].to_i
      scores = VirtualCompetition::AnnualTopScore
               .for_competition(@competition)
               .for_year(year)
               .includes(ASSOCIATIONS)
      @ranking = @competition.annual_ranking(
        scores, year:, page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender]
      )
    end

    def self.controller_path = 'virtual_competitions'
  end
end
