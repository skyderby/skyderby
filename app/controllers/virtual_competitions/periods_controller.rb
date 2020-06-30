module VirtualCompetitions
  class PeriodsController < ApplicationController
    def show
      when_valid_params do
        @competition = PeriodPage.new(params)
      end
    end

    def self.controller_path
      'virtual_competitions'
    end

    private

    def when_valid_params
      competition = VirtualCompetition.find(params[:virtual_competition_id])

      return redirect_to_parent_controller unless competition.custom_intervals?

      yield
    end

    def redirect_to_parent_controller
      redirect_to virtual_competition_path(params[:virtual_competition_id])
    end
  end
end
