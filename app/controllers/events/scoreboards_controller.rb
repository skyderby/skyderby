module Events
  class ScoreboardsController < ApplicationController
    include EventScoped

    def show
      load_event(params[:event_id])

      authorize @event

      @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))

      fresh_when etags_for(@event), last_modified: @event.updated_at

      respond_to do |format|
        format.js
        format.json
        format.html { redirect_to @event }
      end
    end
  end
end
