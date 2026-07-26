module PerformanceCompetitionsHelper
  def performance_time_machine_path(event, position, board:, task: nil)
    query = {}
    query[:until_round] = position unless position.nil?
    query[:including_wind] = '1' if params[:including_wind] == '1'

    case board
    when :open then performance_competition_open_scoreboard_path(event, query)
    when :task then performance_competition_task_scoreboard_path(event, task, query)
    when :teams then performance_competition_teams_path(event, query)
    else performance_competition_path(event, query)
    end
  end
end
