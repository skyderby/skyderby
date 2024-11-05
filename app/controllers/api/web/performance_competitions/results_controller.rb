class Api::Web::PerformanceCompetitions::ResultsController < Api::Web::ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @results =
      if policy(event).update?
        event.results
      elsif !event.surprise?
        event.results.where(round: event.rounds.completed)
      else
        Event::Result.none
      end
  end
end
