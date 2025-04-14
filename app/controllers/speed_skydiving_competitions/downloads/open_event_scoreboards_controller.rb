class SpeedSkydivingCompetitions::Downloads::OpenEventScoreboardsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def show
    @scoreboard = @event.open_standings

    respond_to do |format|
      format.xml do
        response.headers['Content-Disposition'] = "attachment; filename=#{filename}.xml"
      end
      format.xlsx do
        response.headers['Content-Disposition'] = "attachment; filename=#{filename}.xlsx"
      end
    end
  end

  private

  def filename = "#{Time.zone.now.to_date.iso8601} - #{@event.name.to_param}"
end
