class DashboardsController < ApplicationController
  def update
    Current.user&.setting&.update_dashboard_preferences(profile: Current.profile, **preference_params)

    redirect_to root_path
  end

  private

  def preference_params
    params.permit(:mode, :rankings_gender, :journal_period).to_h.symbolize_keys
  end
end
