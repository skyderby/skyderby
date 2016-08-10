class Velocity < DelegateClass(BigDecimal)

  KNOTS_IN_MS = 1.9438444924574
  KMH_IN_MS = 3.6
  MPH_IN_MS = 2.236936

  def self.load(velocity)
    new(velocity) unless velocity.nil?
  end

  def self.dump(obj)
    obj.dump
  end

  def initialize(velocity, unit = 'ms')
    decimal_value = value_to_decimal(velocity)
    value_in_ms = convert_from(decimal_value, unit)
    super(value_in_ms)
  end

  def dump
    @delegate_dc_obj
  end

  def convert_to(unit)
    method = "to_#{unit}"
    raise ArgumentError, "Unsupported unit #{unit}" unless respond_to? method
    send method
  end

  def convert_from(val, unit)
    method = "from_#{unit}"
    raise ArgumentError, "Unsupported unit #{unit}" unless respond_to? method
    send method, val
  end

  def to_ms
    @delegate_dc_obj
  end

  def to_knots
    @delegate_dc_obj * KNOTS_IN_MS
  end

  # Converts speed in m/s to km/h
  # convertation doing by multiplying on 3600 (second in hour)
  # and dividing by 1000 (meters in km).
  # x * 3600 / 1000 = x * 3.6
  def to_kmh
    @delegate_dc_obj * KMH_IN_MS
  end

  def to_mph
    @delegate_dc_obj * MPH_IN_MS
  end

  def from_ms(val)
    val
  end

  def from_knots(val)
    val / KNOTS_IN_MS
  end

  def from_kmh(val)
    val / KMH_IN_MS
  end

  def from_mph(val)
    val / MPH_IN_MS
  end

  def value_to_decimal(value)
    if value.class == BigDecimal
      value
    elsif value.class == Float
      float_val = (value.nan? || value.infinite?) ? 0.0 : value
      float_val.to_d
    elsif value.respond_to?(:to_d)
      value.to_d
    else
      value.to_s.to_d
    end
  end
end
