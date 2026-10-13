module VirtualCompetitions
  class YearController < ApplicationController
    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: [{ place: :country }, :video] },
      { profile: :owner }
    ].freeze

    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      authorize @competition, :show?
      return redirect_to virtual_competition_path(@competition) unless @competition.annual?

      year = params[:year].to_i
      @ranking = @competition.annual_ranking(
        scores_for(year), year:, page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender]
      )
      @ranking.highlight_profile_id = params[:highlight]
    end

    def self.controller_path = 'virtual_competitions'

    private

    def scores_for(year)
      if @competition.multi_discipline?
        @competition.multi_discipline_standings.for_year(year)
      else
        VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(year).includes(ASSOCIATIONS)
      end
    end
  end
end
