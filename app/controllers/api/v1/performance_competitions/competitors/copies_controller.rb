class Api::V1::PerformanceCompetitions::Competitors::CopiesController < Api::ApplicationController
  def create
    source_event = policy_scope(Event.speed_distance_time).find(params[:source_event_id])
    target_event = policy_scope(Event.speed_distance_time).find(params[:performance_competition_id])

    authorize target_event, :update?

    Event::Competitor.copy(source_event, target_event)

    head :ok
  end
end
