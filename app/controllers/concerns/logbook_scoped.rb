module LogbookScoped
  extend ActiveSupport::Concern
  include MasqueradingHelper

  included do
    before_action :authenticate_user!
    before_action :forbid_masquerading
    before_action :require_logbook_profile
  end

  private

  def forbid_masquerading
    head :forbidden if masquerading?
  end

  def require_logbook_profile
    redirect_to root_path unless logbook_profile
  end

  def logbook_profile = Current.profile
end
