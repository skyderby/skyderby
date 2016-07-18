module PreferencesHelper
  def preferred_charts_mode
    session[:preferred_charts_mode] ||= 'separate'
    session[:preferred_charts_mode] = params[:charts_mode] if params[:charts_mode]
    session[:preferred_charts_mode]
  end

  def preferred_charts_units
    session[:preferred_charts_units] ||= 'metric'
    session[:preferred_charts_units] = params[:charts_units] if params[:charts_units]
    session[:preferred_charts_units]
  end

  def preferred_distance_units
    distance_units_by_type(preferred_charts_units)
  end

  def preferred_speed_units
    speed_units_by_type(preferred_charts_units)
  end

  def preferred_altitude_units
    altitude_units_by_type(preferred_charts_units)
  end
end
