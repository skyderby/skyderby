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

    if params[:charts_units]
      session[:preferred_charts_units] = params[:charts_units]
      Current.charts_units = params[:charts_units]
    end
  end
end
