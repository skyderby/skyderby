class Track < ActiveRecord::Base
  attr_accessor :trackfile, :track_index
  belongs_to :user
  belongs_to :wingsuit
  has_one :event_track
  has_many :tracksegments, :dependent => :destroy
  has_many :points, :through => :tracksegments

  enum kind: [:skydive, :base]
  enum visibility: [:public_track, :unlisted_track, :private_track]

  validates :name, :location, :suit, presence: true
  before_save :parse_file

  def calc_results(range_from, range_to)

    fl_time = 0
    distance = 0
    speed = 0

    is_first = true
    prev_point = nil

    track_points = get_track_data
    track_points.each do |current_point|

      is_last = true

      if current_point[:elevation] <= range_from && current_point[:elevation] >= range_to

        is_last = false

        if is_first
          is_first = false
          if current_point[:elevation] != range_from && prev_point.present?
            elev_diff = range_from - current_point[:elevation]
            k = elev_diff / current_point[:elevation_diff]
            fl_time = (current_point[:fl_time] * k).round(1)
            distance = (current_point[:distance] * k).round(0)
          end
          next
        end

        fl_time += current_point[:fl_time].round(1)
        distance += current_point[:distance].round(0)

      end

      if is_last && fl_time > 0
        if current_point[:elevation] <= range_to
          elev_diff = prev_point[:elevation] - range_to
          k = elev_diff / current_point[:elevation_diff]
          fl_time += (current_point[:fl_time] * k).round(1)
          distance += (current_point[:distance] * k).round(0)
        end
        break
      end

      prev_point = current_point

    end

    fl_time = fl_time.round(1)
    distance = distance.round(0)
    speed = Velocity.to_kmh(distance / fl_time).round(0)

    {:fl_time => fl_time,
     :distance => distance,
     :speed => speed}

  end

  def get_charts_data
    get_track_data.to_json.html_safe
  end

  def get_earth_data
    data = get_track_data.map { |x| {:latitude => x[:latitude],
                                      :longitude => x[:longitude],
                                      :h_speed => x[:h_speed],
                                      :elevation => x[:abs_altitude].nil? ? x[:elevation] : x[:abs_altitude]} }
    data.to_json.html_safe
  end

  def get_max_height
    get_track_data.max_by{ |x| x[:elevation] }[:elevation].round
  end

  def get_min_height
    get_track_data.min_by{ |x| x[:elevation] }[:elevation].round
  end

  def get_heights_data
    get_track_data(false).map{ |p| [p[:fl_time_abs], p[:elevation]] }.to_json.html_safe
  end

  def get_duration
    get_track_data(false).map{ |p| p[:fl_time] }.inject(0, :+)
  end

  def presentation
    "#{self.name} | #{self.suit} | #{self.comment}"
  end

  private

  def get_track_data(trim = true)
    arr = []
    prev_point = nil
    fl_time = 0

    points.each do |point|
      if prev_point != nil
        fl_time += point.point_created_at - prev_point.point_created_at
        arr << {:fl_time => point.point_created_at - prev_point.point_created_at,
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

    if trim
      if ff_start.present?
        arr = arr.drop_while{ |x| x[:fl_time_abs] < ff_start}
      end
      if ff_end.present? && ff_end > 0 && (ff_start.blank? || ff_end > ff_start)
        arr.reverse!
        arr = arr.drop_while{ |x| x[:fl_time_abs] > ff_end}
        arr.reverse!
      end
    end

    arr

  end

  def parse_file

    require 'track_parser'

    if self.new_record?

      parser_class = TrackParser.parser(trackfile[:data], trackfile[:ext])
      parser = parser_class.new(trackfile[:data], trackfile[:ext])
      track_points = parser.parse track_index

      if track_points.empty?
        return false
      else
        processed_track_points = process_track_points track_points
        record_track_points processed_track_points
      end
    end

  end

  def process_track_points(track_points)

    require 'geospatial'
    require 'velocity'

    # Пока не придумал что делать с 5 Гц и 10 Гц файлами - оставляю только первую запись по дате создания
    track_points.points.uniq!{ |x| DateTime.strptime(x[:point_created_at], '%Y-%m-%dT%H:%M:%S') }

    min_h = track_points.points.min_by{ |x| x[:elevation] }[:elevation]
    # Уменьшим высоту во всех точках на минимальную. (корректировка относительно уровня земли)
    track_points.points.each do |x|
      x[:elevation] -= min_h
    end

    min_h = track_points.points.min_by{ |x| x[:elevation] }[:elevation]
    max_h = track_points.points.max_by{ |x| x[:elevation] }[:elevation]

    # Расчет дистанции и времени полета
    fl_time = 0

    track_points.points.each_index do |i|
      point = track_points.points[i]
      point[:distance] = 0 if i == 0
      if i > 0
        prev_point = track_points.points.at(i-1)

        datetime_1 = DateTime.strptime(point[:point_created_at], '%Y-%m-%dT%H:%M:%S')
        datetime_2 = DateTime.strptime(prev_point[:point_created_at], '%Y-%m-%dT%H:%M:%S')
        fl_time_diff = (datetime_1 - datetime_2) * 1.days
        fl_time += fl_time_diff

        point[:distance] = Geospatial.distance [prev_point[:latitude], prev_point[:longitude]], [point[:latitude], point[:longitude]]
        point[:h_speed] = Velocity.to_kmh(point[:distance] / fl_time_diff)
        point[:v_speed] = Velocity.to_kmh((prev_point[:elevation] - point[:elevation]) / fl_time_diff)
      end
      point[:fl_time] = fl_time
    end

    # Медианный фильтр для расстояния и высоты
    track_points.points.each_index do |i|

      point = track_points.points[i]

      median_start = [0, i-1].max
      median_end  = [track_points.points.count-1, i+1].min

      median_points = [track_points.points[median_start], point, track_points.points[median_end]]
      point[:distance]  = median_points.map { |x| x[:distance] }.sort[1]
      point[:elevation] = median_points.map { |x| x[:elevation] }.sort[1]
      point[:h_speed]   = median_points.map { |x| x[:h_speed] || 0 }.sort[1]
      point[:v_speed]   = median_points.map { |x| x[:v_speed] || 0 }.sort[1]

    end

    self.ff_start = 0
    self.ff_end = fl_time

    # Развернем массив и найдем точку после достижения максимальной высоты и набору скорости в 25 км/ч
    track_points.points.reverse!
    start_point = track_points.points.detect { |x| x[:elevation] >= (max_h - 15) }
    self.ff_start = start_point[:fl_time] if start_point.present?

    track_points.points.reverse!
    start_point = track_points.points.detect { |x| (x[:fl_time] > self.ff_start && x[:v_speed] > 25) }
    self.ff_start = start_point[:fl_time] if start_point.present?

    # Найдем первую точку ниже минимума (предполагаю Земли) + 50 метров
    end_point = track_points.points.detect { |x| x[:elevation] < (min_h + 50) }
    self.ff_end = end_point[:fl_time] if end_point.present?

    track_points

  end

  def record_track_points(track_points)

    if track_points.points.count < 10
      return false
    end

    trkseg = Tracksegment.create!

    Point.create (track_points.points) do |point|
      point.tracksegment = trkseg
    end

    self.tracksegments << trkseg

  end

end
