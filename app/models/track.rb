class Track < ActiveRecord::Base

  attr_accessor :trackfile, :track_index

  has_many :tracksegments, :dependent => :destroy
  has_many :points, :through => :tracksegments
  before_save :parse_file

  def get_charts_data
    arr = []
    prev_point = nil
  
    points.each do |point|
      if prev_point != nil
        arr << {'fl_time' => point.point_created_at - prev_point.point_created_at,
                'elevation_diff' => (prev_point.elevation - point.elevation).to_i,
                'elevation' => point.elevation.to_i,
                'distance' => point.distance.to_i,
                'h_speed' => point.h_speed.round(2),
                'v_speed' => point.v_speed.round(2),
                'glrat' => (point.h_speed.round(2) / point.v_speed.round(2)).round(2)
                }
      end
      prev_point = point
    end

    return arr.to_json.html_safe
  end

  def get_max_height
    return points.maximum(:elevation).to_i
  end

  private
    def parse_file

      if self.new_record?
        if trackfile['type'] == 'text/csv'
          track_points = parse_csv trackfile['data'], track_index
        else
          doc = Nokogiri::XML(trackfile['data'])
          track_points = parse_xml doc, track_index
        end
      
        if !track_points.empty?
          processed_track_points = process_track_points track_points
          record_track_points processed_track_points
        end
      end

    end

    def get_file_format header

      headers_hash = {'flysight' => ['time','lat','lon','hMSL','velN','velE','velD','hAcc','vAcc','sAcc','gpsFix','numSV'],
                      'columbusV900' => ['INDEX','TAG','DATE','TIME','LATITUDE N/S','LONGITUDE E/W','HEIGHT','SPEED','HEADING','VOX']}

      file_format = headers_hash.select{|key,hash| hash == header}.keys[0]
      return file_format

    end

    def parse_csv_row(row, format)

      if format == 'flysight'
        return nil if row[1].to_f == 0.0 
        return {'latitude' => row[1].to_f, 'longitude' => row[2].to_f, 'elevation' => row[3].to_f, 'point_created_at' => row[0].to_s}
      elsif format == 'columbusV900'
        return nil if row[6].to_f == 0.0
        return {'latitude' => (row[4][0..(row[4].length-2)] * (row[4][row[4].length-1] == 'N' ? 1 : -1)).to_f,
                'longitude' => (row[5][0..(row[5].length-2)] * (row[5][row[5].length-1] == 'E' ? 1 : 01)).to_f, 
                'elevation' => row[6].to_f, 
                'point_created_at' => DateTime.strptime('20' + row[2].to_s + 'T' + row[3].to_s, '%Y%m%dT%H%M%S').strftime('%Y-%m-%dT%H:%M:%S')}
      else 
        return nil
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

    def process_track_points track_points

      min_h = track_points.min_by{ |x| x['elevation'] }['elevation'];

      # Пока не придумал что делать с 5 Гц и 10 Гц файлами - оставляю только первую запись по дате создания
      track_points.uniq!{ |x| DateTime.strptime(x['point_created_at'], '%Y-%m-%dT%H:%M:%S') }
      # Обрежем все точки выше минимума (предполагаю Земли) на 50 метров
      track_points.reject!{ |x| x['elevation'] < (min_h + 50) }
      # Уменьшим высоту во всех точках на минимальную. (корректировка относительно уровня земли)
      track_points.each do |x|
        x['elevation'] -= min_h
      end
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

    
end
