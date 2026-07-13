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

  def speed_skydiving_imperial? = Current.speed_skydiving_units.imperial?

  def speed_skydiving_speed(speed_kmh)
    return if speed_kmh.nil?

    speed_skydiving_imperial? ? kmh_to_mph(speed_kmh) : speed_kmh
  end

  def speed_skydiving_speed_with_unit(speed_kmh, precision: 2)
    key = speed_skydiving_imperial? ? 'mph' : 'kmh'
    t(
      "speed_skydiving_competitions.display.#{key}",
      speed: number_with_precision(speed_skydiving_speed(speed_kmh), precision:)
    )
  end
end
