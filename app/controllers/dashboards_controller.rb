class DashboardsController < ApplicationController
  def update
    persist_mode
    persist_rankings_gender
    persist_journal_period

    redirect_to root_path
  end

  private

  def persist_journal_period
    period = params[:journal_period].to_s.presence_in(Profiles::Journal::PERIODS)
    return unless period

    Current.user&.setting&.update!(journal_period: period)
  end

  def persist_mode
    mode = params[:mode].to_s.presence_in(Profiles::Dashboard::MODES.map(&:to_s))
    return unless mode

    Current.user&.setting&.update!(dashboard_mode: mode)
  end

  def persist_rankings_gender
    return unless params.key?(:rankings_gender) && Current.profile&.female?

    female = params[:rankings_gender].to_s == 'female'
    Current.user&.setting&.update!(dashboard_female_rankings: female)
  end
end
