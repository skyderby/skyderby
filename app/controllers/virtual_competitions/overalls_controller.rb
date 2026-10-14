module VirtualCompetitions
  class OverallsController < ApplicationController
    def show
      @competition = VirtualCompetition.find(params[:virtual_competition_id])
      authorize @competition, :show?

      @ranking = @competition.ranking(page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender])
    end

    def self.controller_path = 'virtual_competitions'
  end
end
