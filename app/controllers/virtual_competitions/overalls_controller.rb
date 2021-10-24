module VirtualCompetitions
  class OverallsController < ApplicationController
    def show
      @competition = OverallPresenter.new(params)

      respond_to do |format|
        format.html
        format.js
      end
    end

    def self.controller_path
      'virtual_competitions'
    end
  end
end
