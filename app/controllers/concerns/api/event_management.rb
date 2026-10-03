module Api
  module EventManagement
    extend ActiveSupport::Concern

    included do
      before_action -> { doorkeeper_authorize! :write }
      before_action :require_registered_user!
      before_action :authorize_event_update!
    end

    private

    def managed_event = @event || @tournament

    def authorize_event_update!
      respond_not_authorized unless managed_event.editable?
    end

    def render_record_errors(record)
      render_errors record.errors.full_messages, status: :unprocessable_content
    end
  end
end
