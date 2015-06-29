module JumpRangeFinder
  def self.range_for(points)
    # Высота начала отсчета определяется как максимум за вычетом 15 метров
    max_h = points.max_by(&:abs_altitude).abs_altitude - 15
    # Высота окончания отсчета опеределяется как минимум + 50 метров
    min_h = points.min_by(&:abs_altitude).abs_altitude + 50

    # Точка начала отсчета определяется как первая точка ниже, как минимум,
    # на 15 метров чем максимальная высота, где скорость достигла 25 км/ч
    start_point = points.reverse.detect { |x| x.abs_altitude >= max_h }

    start_point = points.detect do |x|
      x.fl_time > (start_point.fl_time || 0) &&
      x.v_speed > 25
    end || start_point

    # Точка окончания отсчета диапазона прыжка определяется как
    # точка, где высота впервые достигла 50 метров после точки начала отсчета
    end_point = points.detect do |x|
      x.abs_altitude < min_h &&
      x.fl_time > start_point.fl_time
    end || points.last

    Skyderby::Tracks::JumpRange.new(start_point, end_point)
  end
end
