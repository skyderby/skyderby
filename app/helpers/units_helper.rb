module UnitsHelper
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
