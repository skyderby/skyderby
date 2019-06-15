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
        format.html { redirect_to @event }
        format.xlsx do
          response.headers['Content-Disposition'] = "attachment; filename='#{@event.name.to_param}.xlsx'"
        end
      end
    end
  end
end
