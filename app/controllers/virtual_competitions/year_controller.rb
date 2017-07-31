module VirtualCompetitions
  class YearController < ApplicationController
    def show
      @competition = YearPresenter.new(params)
    end

    def self.controller_path
      'virtual_competitions'
    end
  end
end
