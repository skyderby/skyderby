module DisciplinesHelper
  DISCIPLINE_UNITS = {
    distance: :m,
    speed: :kmh,
    time: :sec,
    distance_in_time: :m
  }

  def discipline_unit(discipline)
    DISCIPLINE_UNITS.fetch(discipline)
  end
end
