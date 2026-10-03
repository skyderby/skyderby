class Api::V1::PerformanceCompetitions::CompetitorsCopiesController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  def create
    source = PerformanceCompetition.find(params.require(:source_event_id))
    raise ActiveRecord::RecordNotFound unless source.viewable?

    @event.copy_competitors_from!(source)
    broadcast_scoreboards
    head :no_content
  rescue ActiveRecord::RecordInvalid => e
    render_record_errors e.record
  end
end
