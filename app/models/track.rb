class Track < ActiveRecord::Base

  attr_accessor :trackfile, :track_index

  has_many :tracksegments, :dependent => :destroy
  has_many :points, :through => :tracksegments
  before_save :parse_file

  def parse_file

    if trackfile['type'] == 'text/csv'
      track_points = parse_csv trackfile['data'], track_index
    else
      doc = Nokogiri::XML(trackfile['data'])
      track_points = parse_xml doc, track_index
    end
    
    processed_track_points = process_track_points track_points
    record_track_points processed_track_points

  end

  def get_file_format header

    headers_hash = {'flysight' => ['time','lat','lon','hMSL','velN','velE','velD','hAcc','vAcc','sAcc','gpsFix','numSV']}
    file_format = headers_hash.select{|key,hash| hash == header}.keys[0]
    return file_format

  end

  def parse_csv_row(row, format)

    if format == 'flysight'
      return nil if row[1].to_f == 0.0 
      return { 'latitude' => row[1].to_f, 'longitude' => row[2].to_f, 'elevation' => row[3].to_f, 'point_created_at' => row[0].to_s }
    end

  end

  def parse_csv(doc, track_index)

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

    return track_points
  end

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
                point_hash = {'latitude' => trpoint.attr('lat').to_f, 'longitude' => trpoint.attr('lon').to_f}
                trpoint.elements.each do |node|
                  point_hash['elevation'] = node.text.to_f if node.name.eql? 'ele'
                  point_hash['point_created_at'] = node.text.to_s if node.name.eql? 'time'
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

    return track_points

  end

  def calc_distance a, b
    rad_per_deg = Math::PI/180  # PI / 180
    rkm = 6371                  # Earth radius in kilometers
    rm = rkm * 1000             # Radius in meters

    dlon_rad = (b[1]-a[1]) * rad_per_deg  # Delta, converted to rad
    dlat_rad = (b[0]-a[0]) * rad_per_deg

    lat1_rad, lon1_rad = a.map! {|i| i * rad_per_deg }
    lat2_rad, lon2_rad = b.map! {|i| i * rad_per_deg }

    a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
    c = 2 * Math.asin(Math.sqrt(a))

    rm * c # Delta in meters
  end

  def process_track_points track_points

    # Пока не придумал что делать с 5 Гц и 10 Гц файлами - оставляю только первую запись по дате создания
    track_points.uniq!{ |x| DateTime.strptime(x['point_created_at'], '%Y-%m-%dT%H:%M:%S') }
    # Обрежем все точки выше минимума (предполагаю Земли) на 50 метров
    track_points.reject!{ |x| x['elevation'] < (track_points.min_by{ |x| x['elevation'] }['elevation'] + 50) }
    # Расчет дистанции и времени полета
    fl_time = 0

    track_points.each_index do |i|
      point = track_points[i]
      point['fl_time'] = fl_time
      point['distance'] = 0 if i == 0
      if i > 0
        prev_point = track_points.at(i-1)
        point['distance'] = calc_distance [prev_point['latitude'], prev_point['longitude']], [point['latitude'], point['longitude']] 
        point['h_speed'] = point['distance'] * 3.6
        point['v_speed'] = (prev_point['elevation'] - point['elevation']) * 3.6
      end
      fl_time += 1
    end

    # Скользящее среднее
    #track_points.each_index do |i|
    #  if i > 0 && i < (track_points.count - 1) 
    #   #sma = track_points[i-(sma_size-3)..i + (sma_size-3)].map{ |x| x['elevation'] }.inject(0.0){ |sum, el| sum + el} / sma_size
    #    sma = (track_points[i-1]['elevation'] + track_points[i+1]['elevation']) / 2 
    #    track_points[i]['elevation'] = sma
    #  end
    #end

    # Медианный фильтр для расстояния и высоты
    track_points.each_index do |i|
      
      point = track_points[i]
      
      median_start = [0, i-1].max
      median_end  = [track_points.count-1, i+1].min
      
      median_points = [track_points[median_start], point, track_points[median_end]]
      point['distance']  = median_points.map { |x| x['distance'] }.sort[1]
      point['elevation'] = median_points.map { |x| x['elevation'] }.sort[1]
      point['h_speed']   = median_points.map { |x| x['h_speed'] || 0 }.sort[1]
      point['v_speed']   = median_points.map { |x| x['v_speed'] || 0 }.sort[1]
      
    end

    # Low Pass Filter
    #lpf_k = 0.7
    #track_points.each_index do |i|
    #  if i>1
    #    track_points[i]['elevation'] = track_points[i-1]['elevation'] * lpf_k + track_points[i]['elevation'] * (1-lpf_k)
    #  end
    #end

    # Обрежем все точки до первой, где вертикальная скорость превысила 20 км/ч
    track_points = track_points.drop_while { |x| x['v_speed'] < 20 }

    return track_points

  end

  def record_track_points track_points

    trkseg = Tracksegment.new
    
    track_points.each do |trkpoint|
      tmp_point = Point.new :latitude => trkpoint['latitude'],
                            :longitude => trkpoint['longitude'],
                            :elevation => trkpoint['elevation'],
                            :distance => trkpoint['distance'],
                            :v_speed => trkpoint['v_speed'],
                            :h_speed => trkpoint['h_speed'],
                            :point_created_at => trkpoint['point_created_at'],
                            :fl_time => trkpoint['fl_time']
      trkseg.points << tmp_point
    end

    self.tracksegments << trkseg
  
  end

  def get_distance

    return points.sum(:distance)

  end

  def get_flight_time

    return (points.maximum(:point_created_at) - points.minimum(:point_created_at))

  end 

  def get_avg_horizontal_speed
    
    return ((get_distance / get_flight_time) * 3.6)
  
  end

  def get_elevation

    return (points.maximum(:elevation) - points.minimum(:elevation))

  end 

  def get_avg_vertical_speed

    return ((get_elevation / get_flight_time) * 3.6)
  
  end

  def get_glide_ratio

    return (get_distance / get_elevation)

  end

  # Функция получает данные для графика высоты
  def get_elev_chart_data
    arr = []
    points.each do |point|
      arr << [point.fl_time.to_i, point.elevation.to_i]
    end
    return arr
  end

  # Функция получает данные для графика пройденного расстояния
  def get_dist_chart_data
    arr = []
    dist = 0
    points.each do |point|
      dist += point.distance.to_i
      arr << [point.fl_time.to_i, dist]
    end
    return arr
  end

  # Функция получает данные для графика вертикальной скорости
  def get_v_speed_chart_data
    arr = []
    points.each do |point|
      arr << [point.fl_time, point.v_speed] if point.fl_time > 0
    end
    return arr
  end

  # Функция получает данные для графика горизонтальной скорости
  def get_h_speed_chart_data
    arr = []
    points.each do |point|
      arr << [point.fl_time, point.h_speed] if point.fl_time > 0
    end
    return arr
  end

  # Функция получает данные для графика качества полета
  def get_gr_chart_data
    arr = []
    points.each do |point|
      arr << [point.fl_time, point.h_speed / point.v_speed] if point.v_speed || 0 > 0
    end
    return arr
  end







end
