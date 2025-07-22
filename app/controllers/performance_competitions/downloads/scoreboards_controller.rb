class PerformanceCompetitions::Downloads::ScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event, :set_scoreboard
  before_action :authorize_event_access!

  def show
    respond_to do |format|
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
    @event = PerformanceCompetition.find(params[:performance_competition_id])
  end

  def set_scoreboard
    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))
  end
end
