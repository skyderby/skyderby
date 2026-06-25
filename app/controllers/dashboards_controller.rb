class DashboardsController < ApplicationController
  def update
    mode = params[:mode].to_s.presence_in(Profiles::Dashboard::MODES.map(&:to_s))
    # rubocop:disable Rails/SkipsModelValidations
    Current.profile&.update_column(:dashboard_mode, mode) if mode
    # rubocop:enable Rails/SkipsModelValidations

    redirect_to root_path
  end
end
