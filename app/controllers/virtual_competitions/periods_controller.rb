module VirtualCompetitions
  class PeriodsController < ApplicationController
    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: :video },
      { profile: :owner }
    ].freeze

    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      return redirect_to virtual_competition_path(@competition) unless @competition.custom_intervals?

      interval = @competition.intervals.find_by(slug: params[:id])
      scores = @competition.interval_top_scores.for(interval).wind_cancellation(false).includes(ASSOCIATIONS)
      @ranking = @competition.period_ranking(scores, page: params[:page], jump_kind: params[:jump_kind])
    end

    def self.controller_path = 'virtual_competitions'
  end
end
