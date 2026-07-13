module ChartParams
  extend ActiveSupport::Concern

  included do
    before_action :save_chart_settings, only: :show # rubocop:disable Rails/LexicallyScopedActionFilter
  end

  def save_chart_settings
    if params[:charts_mode]
      session[:preferred_charts_mode] = params[:charts_mode]
      Current.charts_mode = params[:charts_mode]
    end

    save_charts_units if %w[metric imperial].include?(params[:charts_units])
  end

  def save_charts_units
    if (profile = Current.user&.profile)
      profile.update(default_units: params[:charts_units])
    else
      session[:preferred_charts_units] = params[:charts_units]
    end
    Current.charts_units = params[:charts_units]
  end
end
