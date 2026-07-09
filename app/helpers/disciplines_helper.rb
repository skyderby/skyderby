module DisciplinesHelper
  DISCIPLINE_UNITS = {
    distance: :m,
    flare: :m,
    speed: :kmh,
    vertical_speed: :kmh,
    time: :sec,
    distance_in_time: :m
  }.with_indifferent_access.freeze

  DISTANCE_DISCIPLINES = %w[distance distance_in_time distance_in_altitude].freeze

  def discipline_unit(discipline)
    DISCIPLINE_UNITS.fetch(discipline)
  end

  def discipline_result(discipline, value)
    DISTANCE_DISCIPLINES.include?(discipline.to_s) ? value.round : value.round(1)
  end
end
