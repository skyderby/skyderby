module LogbookHelper
  WIND_CENTER = [110, 120].freeze
  WIND_RINGS = { light: [26, 52], medium: [52, 78], strong: [78, 104] }.freeze
  WIND_ANGLES = { front: -90, right: 0, back: 90, left: 180 }.freeze
  WIND_LABELS = {
    front: [110, 10, 'middle'], right: [218, 124, 'start'], back: [110, 238, 'middle'], left: [2, 124, 'end']
  }.freeze

  def logbook_duration(seconds)
    return if seconds.blank?

    hours, remainder = seconds.divmod(3600)
    minutes, secs = remainder.divmod(60)
    hours.positive? ? format('%d:%02d:%02d', hours, minutes, secs) : format('%d:%02d', minutes, secs)
  end

  def wind_sector_path(strength, direction)
    inner, outer = WIND_RINGS.fetch(strength)
    angle = WIND_ANGLES.fetch(direction)
    outer_from, outer_to, inner_to, inner_from =
      [[outer, angle - 45], [outer, angle + 45], [inner, angle + 45], [inner, angle - 45]]
      .map { |radius, degrees| wind_point(radius, degrees) }

    "M#{outer_from} A#{outer} #{outer} 0 0 1 #{outer_to} L#{inner_to} A#{inner} #{inner} 0 0 0 #{inner_from} Z"
  end

  def wind_label(strength, direction = nil)
    [t("logbook.wind_strengths.#{strength}"), (t("logbook.wind_directions.#{direction}").downcase if direction)]
      .compact.join(', ')
  end

  private

  def wind_point(radius, degrees)
    x, y = WIND_CENTER
    radians = degrees * Math::PI / 180
    format('%<x>.2f %<y>.2f', x: x + (radius * Math.cos(radians)), y: y + (radius * Math.sin(radians)))
  end
end
