class PointInterpolation
  class ValueOutOfRange < StandardError; end

  def initialize(first_point, second_point)
    @first_point = first_point
    @second_point = second_point
  end

  def execute(by:, with_value:)
    factor = interpolation_factor(by, with_value)
    interpolate(factor)
  end

  private

  INTERPOLATION_FIELDS =
    %i[gps_time latitude longitude altitude h_speed v_speed distance].freeze

  def interpolate(factor)
    new_point = @first_point.clone

    INTERPOLATION_FIELDS.each do |key|
      next unless new_point.key? key

      new_point[key] = interpolate_field(key, factor)
    end

    new_point
  end

  def interpolation_factor(field, value)
    # As of documentation states for #between method
    # the first argument is min and the second is max
    raise ValueOutOfRange unless value.between?(
      [@first_point[field], @second_point[field]].min,
      [@first_point[field], @second_point[field]].max
    )

    (@first_point[field].to_f - value.to_f) /
      (@first_point[field].to_f - @second_point[field].to_f)
  end

  def interpolate_field(field, factor)
    @first_point[field] + ((@second_point[field] - @first_point[field]) * factor)
  end
end
