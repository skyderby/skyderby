module VirtualCompetitions
  class PeriodsController < ApplicationController
    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: :video },
      { profile: :owner }
    ].freeze

    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      authorize @competition, :show?
      return redirect_to virtual_competition_path(@competition) unless @competition.custom_intervals?

      interval = @competition.intervals.find_by(slug: params[:id])
      @ranking = @competition.period_ranking(
        scores_for(interval), page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender]
      )
      @ranking.highlight_profile_id = params[:highlight]
    end

    def self.controller_path = 'virtual_competitions'

    private

    def scores_for(interval)
      if @competition.multi_discipline?
        @competition.multi_discipline_standings.for_interval(interval)
      else
        @competition.interval_top_scores.for(interval).wind_cancellation(false).includes(ASSOCIATIONS)
      end
    end
  end
end
