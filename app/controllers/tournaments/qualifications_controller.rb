module Tournaments
  class QualificationsController < ApplicationController
    def show
      @tournament = Tournament.find(params[:tournament_id])
    end
  end
end
