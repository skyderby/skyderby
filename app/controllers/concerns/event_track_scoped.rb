module EventTrackScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_event, :authorize_event, :set_event_track
  end

  private

  def set_event_track
    @event_track = @event.event_tracks.find(params[:event_track_id])
  end

  def respond_with_scoreboard
    create_scoreboard(params[:event_id])
    respond_to do |format|
      format.js { render template: 'events/event_tracks/scoreboard_with_highlight' }
    end
  end
end
