module Events
  class ScoreboardsController < ApplicationController
    include EventScoped

    before_action :set_event, :set_scoreboard

    def show
      fresh_when etags_for(@event), last_modified: @event.updated_at

      respond_to do |format|
        format.js
        format.html { redirect_to @event }
        format.xml do
          formatted_date = Time.zone.now.to_date.iso8601
          response.headers['Content-Disposition'] =
            "attachment; filename=#{formatted_date} - #{@event.name.to_param}.xml"
        end
        format.xlsx do
          response.headers['Content-Disposition'] =
            "attachment; filename=#{@event.name.to_param}.xlsx"
        end
      end
    end

    private

    def set_event
      @event = authorize Event.find(params[:event_id])
    end

    def set_scoreboard
      @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))
    end
  end
end
