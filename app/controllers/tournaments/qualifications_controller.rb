module Tournaments
  class QualificationsController < ApplicationController
    def show
      response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

      @tournament = Tournament.find(params[:tournament_id])

      authorize @tournament
    end
  end
end
