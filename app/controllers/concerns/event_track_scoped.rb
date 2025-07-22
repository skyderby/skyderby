module EventTrackScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_event, :authorize_event_update!, :set_result
  end

  private

  def set_result
    @result = @event.results.find(params[:result_id])
  end
end
