require 'geospatial'
require 'velocity'
require 'median_filter'
include MedianFilter

class TrackPoints

  attr_reader :points, :min_h, :max_h, :fl_time
  attr_accessor :tracksegment

  def initialize(track = nil)

    @points = []
    @min_h = 0
    @max_h = 0
    @fl_time = 0

    read(track) if track.present?

  end

  def add(row)
    @points << row
  end

  def compact!
    @points.compact!
    self
  end

  def process_data!

    filter_by_freq!
    corr_elevation!
    calc_parameters!
    median_filter!

  end

  def create_points
    Point.create (@points) do |point|
      if block_given?
        yield point
      end
    end
  end

  def trim!(from, to)

    if from.present?
      @points = @points.drop_while{ |x| x[:fl_time_abs] < from}
    end
    if to.present? && ff_end > 0 && (from.blank? || to > from)
      @points = @points.reverse.drop_while{ |x| x[:fl_time_abs] > to}.reverse
    end

    self

  end

  # Разворачивает массив и находит точку после достижения максимальной высоты и набору скорости в 25 км/ч
  def ff_start

    ff_start_val = 0

    start_point = @points.reverse.detect { |x| x[:elevation] >= (@max_h - 15) }
    ff_start_val = start_point[:fl_time] if start_point.present?

    start_point = @points.detect { |x| (x[:fl_time] > ff_start_val && x[:v_speed] > 25) }
    ff_start_val = start_point[:fl_time] if start_point.present?

    ff_start_val

  end

  def ff_end

    end_point = @points.detect { |x| x[:elevation] < (@min_h + 50) }
    end_point.present? ? end_point[:fl_time] : @fl_time

  end

  def empty?
    @points.empty?
  end

  private

  def read(track)

    points = Point.joins(:tracksegment).where('tracksegments.track_id' => track.id).to_a

    prev_point = nil

    points.each do |point|
      if prev_point != nil
        @fl_time += point.point_created_at - prev_point.point_created_at
        @points << {:fl_time => point.point_created_at - prev_point.point_created_at,
                :fl_time_abs => fl_time,
                :elevation_diff => (prev_point.elevation - point.elevation).round(2),
                :elevation => point.elevation.round(2),
                :abs_altitude => point.abs_altitude,
                :latitude => point.latitude,
                :longitude => point.longitude,
                :distance => point.distance.to_i,
                :h_speed => point.h_speed.round(2),
                :v_speed => point.v_speed.round(2),
                :glrat => (point.h_speed.round(2) / point.v_speed.round(2)).round(2)
        }
      end
      prev_point = point
    end

    read_min_max_h

  end

  def read_min_max_h
    @min_h = @points.min_by { |x| x[:elevation] }[:elevation]
    @max_h = @points.max_by { |x| x[:elevation] }[:elevation]
  end

  # Приведение прочитанных данных к формату 1 Гц
  def filter_by_freq!
    @points.uniq!{ |x| DateTime.strptime(x[:point_created_at], '%Y-%m-%dT%H:%M:%S') }
  end

  # Корректировка высоты от уровня земли
  def corr_elevation!
    min_h = @points.min_by{ |x| x[:elevation] }[:elevation]
    @points.each do |x|
      x[:elevation] -= min_h
    end
  end

  # Медианный фильтр для расстояния, высоты, скоростей
  def median_filter!
    @points = MedianFilter.process( @points,
                                   3,
                                   [:distance, :elevation, :h_speed, :v_speed] )
  end

  def calc_parameters!

    prev_point = nil

    @points.each do |point|
      point[:distance] = 0 if prev_point.nil?
      unless prev_point.nil?
        datetime_1 = DateTime.strptime(point[:point_created_at], '%Y-%m-%dT%H:%M:%S')
        datetime_2 = DateTime.strptime(prev_point[:point_created_at], '%Y-%m-%dT%H:%M:%S')
        fl_time_diff = (datetime_1 - datetime_2) * 1.days
        @fl_time += fl_time_diff

        point[:distance] = Geospatial.distance [prev_point[:latitude], prev_point[:longitude]], [point[:latitude], point[:longitude]]
        point[:h_speed] = Velocity.to_kmh(point[:distance] / fl_time_diff)
        point[:v_speed] = Velocity.to_kmh((prev_point[:elevation] - point[:elevation]) / fl_time_diff)
      end
      point[:fl_time] = @fl_time
      prev_point = point
    end

  end

end