module VirtualCompetitions
  class OverallsController < ApplicationController
    def show
      @competition = OverallPresenter.new(params)
    end

    def self.controller_path
      'virtual_competitions'
    end
  end
end
