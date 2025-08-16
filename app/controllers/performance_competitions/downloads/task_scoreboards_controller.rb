class PerformanceCompetitions::Downloads::TaskScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

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
                  filename: "task-scoreboards-#{@event.name.parameterize}.zip"
      end
    end
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:performance_competition_id])
  end

  def write_files_to_archive(zip)
    tasks = @event.rounds.pluck(:discipline).uniq
    tasks.each do |task|
      scoreboard = @event.task_standings(task, wind_cancellation: @event.wind_cancellation)

      zip.put_next_entry("#{task.downcase.parameterize}.xml")
      zip.write(render_to_string('show', locals: { task:, standings: scoreboard.standings }))
    end
  end
end
