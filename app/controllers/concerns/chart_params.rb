module ChartParams
  extend ActiveSupport::Concern

  included do
    before_action :save_chart_settings, only: :show
  end

  def save_chart_settings
    session[:preferred_charts_mode]  = params[:charts_mode]  if params[:charts_mode]
    session[:preferred_charts_units] = params[:charts_units] if params[:charts_units]
  end
end
