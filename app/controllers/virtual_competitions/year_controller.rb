module VirtualCompetitions
  class YearController < ApplicationController
    def show
      when_valid_params do
        @competition = YearPresenter.new(params)
      end

      respond_to do |format|
        format.html
        format.js
      end
    end

    def self.controller_path
      'virtual_competitions'
    end

    private

    def when_valid_params
      competition = VirtualCompetition.find(params[:virtual_competition_id])

      return redirect_to_parent_controller unless competition.annual?

      yield
    end

    def redirect_to_parent_controller
      redirect_to virtual_competition_path(params[:virtual_competition_id])
    end
  end
end
