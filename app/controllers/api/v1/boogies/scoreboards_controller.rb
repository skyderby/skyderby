module Api
  module V1
    module Boogies
      class ScoreboardsController < Api::ApplicationController
        def show
          @event = Boogie.includes(place: :country).find(params[:boogie_id])
          raise ActiveRecord::RecordNotFound unless @event.viewable?

          @scoreboard = @event.standings
          fresh_when @event
        end
      end
    end
  end
end
