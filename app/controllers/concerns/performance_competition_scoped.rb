module PerformanceCompetitionScoped
  extend ActiveSupport::Concern

  include PerformanceCompetitionBroadcasts

  def respond_with_scoreboard(toast: nil)
    @toast = toast
    respond_to do |format|
      format.turbo_stream { render template: 'performance_competitions/update_scoreboard' }
    end
  end

  def load_event(event_id)
    @event = PerformanceCompetition.includes(
      organizers: [{ user: :profile }],
      sponsors: :sponsorable
    ).find(event_id)
  end

  def authorize_event_access!
    respond_not_authorized unless @event.viewable?
  end

  def authorize_event_update!
    respond_not_authorized unless @event.editable?
  end

  def set_event
    @event = PerformanceCompetition.find(params[:performance_competition_id])
  end
end
