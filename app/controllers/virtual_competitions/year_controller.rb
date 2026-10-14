module VirtualCompetitions
  class YearController < ApplicationController
    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      authorize @competition, :show?
      return redirect_to virtual_competition_path(@competition) unless @competition.annual?

      @ranking = @competition.ranking(
        year: params[:year].to_i, page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender]
      )
      @ranking.highlight_profile_id = params[:highlight]
    end

    def self.controller_path = 'virtual_competitions'
  end
end
