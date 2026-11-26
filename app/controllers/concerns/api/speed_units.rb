module Api::SpeedUnits
  extend ActiveSupport::Concern

  included do
    helper_method :api_speed
  end

  private

  def speed_units = params[:units] == 'ms' ? :ms : :kmh

  def api_speed(value) = speed_units == :ms ? value : Track::Points.to_kmh(value)
end
