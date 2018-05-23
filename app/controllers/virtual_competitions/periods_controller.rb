module VirtualCompetitions
  class PeriodsController < ApplicationController
    def show
      @competition = PeriodPage.new(params)
    end

    def self.controller_path
      'virtual_competitions'
    end
  end
end
