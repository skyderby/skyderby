module DisciplinesHelper
  DISCIPLINE_UNITS = {
    distance: :m,
    flare: :m,
    speed: :kmh,
    vertical_speed: :kmh,
    time: :sec,
    distance_in_time: :m
  }.with_indifferent_access.freeze

  def discipline_unit(discipline)
    DISCIPLINE_UNITS.fetch(discipline)
  end
end
