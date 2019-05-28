class Distance < DelegateClass(BigDecimal)
  # Conversion factors
  # Feets in meter
  FT_IN_M = 3.280839895
  # Meters in mile
  M_IN_MI = 1609.344

  def self.load(distance)
    new(distance) unless distance.nil?
  end

  def self.dump(obj)
    return obj unless obj.class == Distance

    obj.dump
  end

  def initialize(distance, unit = 'm')
    decimal_value = value_to_decimal(distance)
    value_in_m = convert_from(decimal_value, unit)
    super(value_in_m)
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

  def value_to_decimal(value)
    if value.class == BigDecimal
      value
    elsif value.respond_to?(:to_d)
      value.to_d
    else
      value.to_s.to_d
    end
  end

  def to_m
    @delegate_dc_obj
  end

  def to_mi
    @delegate_dc_obj / M_IN_MI
  end

  def to_ft
    @delegate_dc_obj * FT_IN_M
  end

  def from_m(val)
    val
  end

  def from_mi(val)
    val * M_IN_MI
  end

  def from_ft(val)
    val / FT_IN_M
  end
end
