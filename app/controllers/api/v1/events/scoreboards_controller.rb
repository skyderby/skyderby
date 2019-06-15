module Api
  module V1
    module Events
      class ScoreboardsController < ApplicationController
        include EventScoped

        def show
          load_event(params[:event_id])

          authorize @event

          @scoreboard = ::Events::Scoreboards.for(@event, scoreboard_params(@event))

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
