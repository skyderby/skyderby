module Events
  class ScoreboardsController < ApplicationController
    include EventScoped

    def show
      load_event(params[:event_id])

      authorize @event

      @scoreboard = Events::ScoreboardFactory.new(@event, @display_raw_results).create

      fresh_when etags_for(@event), last_modified: @event.updated_at

      respond_to do |format|
        format.js
        format.json
      end
    end
  end
end
