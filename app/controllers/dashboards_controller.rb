class DashboardsController < ApplicationController
  def update
    persist_mode
    persist_rankings_gender

    redirect_to root_path
  end

  private

  def persist_mode
    mode = params[:mode].to_s.presence_in(Profiles::Dashboard::MODES.map(&:to_s))
    return unless mode

    # rubocop:disable Rails/SkipsModelValidations
    Current.profile&.update_column(:dashboard_mode, mode)
    # rubocop:enable Rails/SkipsModelValidations
  end

  def persist_rankings_gender
    return unless params.key?(:rankings_gender) && Current.profile&.female?

    female = params[:rankings_gender].to_s == 'female'
    # rubocop:disable Rails/SkipsModelValidations
    Current.profile.update_column(:dashboard_female_rankings, female)
    # rubocop:enable Rails/SkipsModelValidations
  end
end
