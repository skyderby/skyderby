class PerformanceCompetitions::Downloads::ScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event, :set_scoreboard
  before_action :authorize_event_update!

  def show
    respond_to do |format|
      format.xml do
        zip_stream = Zip::OutputStream.write_buffer do |zip|
          write_files_to_archive(zip)
        end

        zip_stream.rewind
        send_data zip_stream.read,
                  type: 'application/zip',
                  disposition: 'attachment',
                  filename: "performance-scoreboards-#{@event.name.parameterize}.zip"
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

  def write_files_to_archive(zip)
    @scoreboard.categories.each do |category, standings|
      zip.put_next_entry("#{category.name.downcase.parameterize}.xml")
      zip.write(render_to_string('show', locals: { category:, standings: }))
    end
  end

  def set_scoreboard
    @scoreboard = @event.standings(wind_cancellation: @event.wind_cancellation)
  end
end
