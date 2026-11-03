module ApiLogbookScoped
  extend ActiveSupport::Concern

  included do
    before_action -> { doorkeeper_authorize!(request.get? ? :read : :write) }
    before_action :forbid_impersonation!
    before_action :require_logbook_profile
  end

  private

  def require_logbook_profile
    render_errors ['Profile not found'], status: :not_found unless logbook_profile
  end

  def logbook_profile = current_user.profile
end
