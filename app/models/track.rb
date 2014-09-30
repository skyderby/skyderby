class Track < ActiveRecord::Base

  enum kind: [ :skydive, :base ]

  attr_accessor :trackfile, :track_index

  belongs_to :user
  belongs_to :wingsuit

  has_one :event_track

  has_many :tracksegments, :dependent => :destroy
  has_many :points, :through => :tracksegments
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
    speed = (distance / fl_time * 3.6).round(0)

    {:fl_time => fl_time,
     :distance => distance,
     :speed => speed}

  end

  def get_charts_data
    get_track_data.to_json.html_safe
  end

  def get_max_height
    points.maximum(:elevation).to_i
  end

  def presentation
    "#{self.name} | #{self.suit} | #{self.comment}"
  end

  private

  def get_track_data
    arr = []
    prev_point = nil

    points.each do |point|
      if prev_point != nil
        arr << {:fl_time => point.point_created_at - prev_point.point_created_at,
                :elevation_diff => (prev_point.elevation - point.elevation).round(2),
                :elevation => point.elevation.round(2),
                :distance => point.distance.to_i,
                :h_speed => point.h_speed.round(2),
                :v_speed => point.v_speed.round(2),
                :glrat => (point.h_speed.round(2) / point.v_speed.round(2)).round(2)
        }
      end
      prev_point = point
    end

    arr
  end

  def parse_file

    track_points = []

    if self.new_record?
      if trackfile[:ext] == '.csv'
        track_points = parse_csv trackfile[:data]
      elsif trackfile[:ext] == '.gpx'
        doc = Nokogiri::XML(trackfile[:data])
        track_points = parse_xml doc, track_index
      end

      if track_points.empty?
        return false
      else
        processed_track_points = process_track_points track_points
        record_track_points processed_track_points
      end
    end

  end

  def get_file_format(header)

    headers_hash = {:flysight => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc gpsFix numSV),
                    :flysight2 => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc heading cAcc gpsFix numSV),
                    :columbusV900 => %w(INDEX TAG DATE TIME LATITUDE\ N/S LONGITUDE\ E/W HEIGHT SPEED HEADING VOX)}

    headers_hash.select{|key,hash| hash == header}.keys[0]

  end

  def parse_csv_row(row, format)

    if (format == :flysight) || (format ==:flysight2)
      return nil if (row[1].to_f == 0.0 || row[8].to_i > 70)
      {:latitude => row[1].to_f, :longitude => row[2].to_f, :elevation => row[3].to_f, :point_created_at => row[0].to_s}
    elsif format == :columbusV900
      return nil if row[6].to_f == 0.0
      {:latitude => (row[4][0..(row[4].length-2)] * (row[4][row[4].length-1] == 'N' ? 1 : -1)).to_f,
        :longitude => (row[5][0..(row[5].length-2)] * (row[5][row[5].length-1] == 'E' ? 1 : 01)).to_f,
        :elevation => row[6].to_f,
        :point_created_at => DateTime.strptime('20' + row[2].to_s + 'T' + row[3].to_s, '%Y%m%dT%H%M%S').strftime('%Y-%m-%dT%H:%M:%S')}
    else
      nil
    end

  end

  def parse_csv(doc)

    require 'csv'

    track_points = []
    file_format = nil

    CSV.parse(doc) do |row|

      if file_format == nil
        file_format = get_file_format row
        if file_format == nil
          break
        end
        next
      end

      track_points << parse_csv_row(row, file_format)
    end

    track_points.compact!
  end

  # TODO: refactor that
  def parse_xml(doc, track_index)

    track_points = []

    index = 0

    doc.root.elements.each do |trks|
      # Обход всех треков в файле и разбор выбранного пользователем
      if trks.node_name.eql? 'trk'
        if index.to_i == track_index.to_i
          # Если это выбранный трек - обход всех сегментов
          trks.elements.each do |trkseg|
            if trkseg.node_name.eql? 'trkseg'
              # Обход всех точек сегмента и формирование массива хэшей
              trkseg.elements.each do |trpoint|
                point_hash = {:latitude => trpoint.attr('lat').to_f, :longitude => trpoint.attr('lon').to_f}
                trpoint.elements.each do |node|
                  point_hash[:elevation] = node.text.to_f if node.name.eql? 'ele'
                  point_hash[:point_created_at] = node.text.to_s if node.name.eql? 'time'
                end
                track_points << point_hash
              end
            end
          end
          break
        end
        index += 1
      end
    end

    track_points

  end

  def calc_distance(a, b)
    rad_per_deg = Math::PI/180  # PI / 180
    rkm = 6371                  # Радиус земли в километрах
    rm = rkm * 1000

    dlon_rad = (b[1]-a[1]) * rad_per_deg
    dlat_rad = (b[0]-a[0]) * rad_per_deg

    lat1_rad, lon1_rad = a.map! {|i| i * rad_per_deg }
    lat2_rad, lon2_rad = b.map! {|i| i * rad_per_deg }

    a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
    c = 2 * Math.asin(Math.sqrt(a))

    rm * c # Расстояние в метрах
  end

  def process_track_points(track_points)

    # Пока не придумал что делать с 5 Гц и 10 Гц файлами - оставляю только первую запись по дате создания
    track_points.uniq!{ |x| DateTime.strptime(x[:point_created_at], '%Y-%m-%dT%H:%M:%S') }

    min_h = track_points.min_by{ |x| x[:elevation] }[:elevation]
    max_h = track_points.max_by{ |x| x[:elevation] }[:elevation]

    # Развернем массив и обрежем все точки после достижения максимальной высоты
    tmp_points = []
    track_points.reverse!
    track_points.each do |x|
      tmp_points << x
      if x[:elevation] >= (max_h - 15)
        break
      end
    end

    # Обрежем все точки ниже минимума (предполагаю Земли) + 50 метров
    track_points = []
    tmp_points.reverse!
    tmp_points.each do |x|
      track_points << x
      if x[:elevation] <= (min_h + 50)
        break
      end
    end

    # Уменьшим высоту во всех точках на минимальную. (корректировка относительно уровня земли)
    track_points.each do |x|
      x[:elevation] -= min_h
    end
    # Расчет дистанции и времени полета
    fl_time = 0

    track_points.each_index do |i|
      point = track_points[i]
      point[:fl_time] = fl_time
      point[:distance] = 0 if i == 0
      if i > 0
        prev_point = track_points.at(i-1)
        point[:distance] = calc_distance [prev_point[:latitude], prev_point[:longitude]], [point[:latitude], point[:longitude]]
        point[:h_speed] = point[:distance] * 3.6
        point[:v_speed] = (prev_point[:elevation] - point[:elevation]) * 3.6
      end
      fl_time += 1
    end

    # Медианный фильтр для расстояния и высоты
    track_points.each_index do |i|

      point = track_points[i]

      median_start = [0, i-1].max
      median_end  = [track_points.count-1, i+1].min

      median_points = [track_points[median_start], point, track_points[median_end]]
      point[:distance]  = median_points.map { |x| x[:distance] }.sort[1]
      point[:elevation] = median_points.map { |x| x[:elevation] }.sort[1]
      point[:h_speed]   = median_points.map { |x| x[:h_speed] || 0 }.sort[1]
      point[:v_speed]   = median_points.map { |x| x[:v_speed] || 0 }.sort[1]

    end

    # Обрежем все точки до первой, где вертикальная скорость превысила 20 км/ч
    track_points.drop_while { |x| x[:v_speed] < 25 }

  end

  def record_track_points(track_points)

    if track_points.count < 10
      return false
    end

    trkseg = Tracksegment.new

    track_points.each do |trkpoint|
      trkseg.points << Point.new(trkpoint)
    end

    self.tracksegments << trkseg

  end

end
