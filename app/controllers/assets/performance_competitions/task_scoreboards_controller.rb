require 'zip'

class Assets::PerformanceCompetitions::TaskScoreboardsController < ApplicationController
  before_action :set_event

  def show
    authorize @event, :download?

    zip_stream = Zip::OutputStream.write_buffer do |zip|
      write_files_to_archive(zip)
    end

    zip_stream.rewind
    send_data zip_stream.read,
              type: 'application/zip',
              disposition: 'attachment',
              filename: "task-standings-#{@event.name.parameterize}.zip"
  end

  private

  def write_files_to_archive(zip)
    %w[speed distance time].each do |task|
      current_task_rounds = rounds.select { _1.task == task }

      standings = PerformanceCompetition::Scoreboard::Standings.build(competitors, current_task_rounds, results)

      zip.put_next_entry("#{task}.xml")
      zip.write(render_to_string('show', locals: { task: task, standings: }))
    end
  end

  def rounds
    @rounds ||= @event.rounds.completed.ordered
  end

  def competitors
    @competitors ||= @event.competitors.includes(:section)
  end

  def results
    @results ||= @event.results.includes(:round, :competitor)
  end

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end
end
