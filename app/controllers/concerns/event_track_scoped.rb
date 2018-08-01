module EventTrackScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_event, :authorize_event, :set_result
  end

  private

  def set_result
    @result = @event.results.find(params[:result_id])
  end

  def respond_with_scoreboard
    create_scoreboard(params[:event_id])
    respond_to do |format|
      format.js { render template: 'events/results/scoreboard_with_highlight' }
    end
  end
end
