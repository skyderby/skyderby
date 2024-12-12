module UnitsHelper
  def kmh_to_mph(speed) = speed * 0.621371

  def m_to_ft(distance) = distance * 3.28084

  def distance_units_by_type(unit_type)
    unit_type == 'metric' ? 'm' : 'mi'
  end

  def altitude_units_by_type(unit_type)
    unit_type == 'metric' ? 'm' : 'ft'
  end

  def speed_units_by_type(unit_type)
    unit_type == 'metric' ? 'kmh' : 'mph'
  end
end
