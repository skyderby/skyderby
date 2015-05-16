require 'geospatial'
require 'velocity'
require 'parser_selector'

module TrackPointsProcessor

  class TPProcessor

    def initialize(points)
      @points = points
    end

    def process
      return nil if @points.count < 10

      # filter_by_freq!
      corr_elevation!
      calc_parameters!

      @points
    end

    private

    # Исключение дублирующихся точек
    #def filter_by_freq!
    #  @points.uniq!{ |x| x.gps_time }
    #end

    # Корректировка высоты от уровня земли
    def corr_elevation!
      min_height = @points.min_by { |x| x.elevation }[:elevation]
      @points.each do |x|
        x.elevation -= min_height
      end
    end

    def calc_parameters!
      prev_point = nil
      fl_time = 0

      @points.each do |point|
        point.distance = 0 if prev_point.nil?
        unless prev_point.nil?
          fl_time_diff = point.gps_time - prev_point.gps_time
          fl_time += fl_time_diff

          point.distance = Geospatial.distance(
            [prev_point.latitude, prev_point.longitude], 
            [point.latitude, point.longitude]
          )

          point.h_speed ||=
            if fl_time_diff == 0
              prev_point.h_speed
            else
              Velocity.to_kmh(point.distance / fl_time_diff)
            end

          point.v_speed ||=
            if fl_time_diff == 0
              prev_point.v_speed
            else
              Velocity.to_kmh((prev_point.elevation - point.elevation) / fl_time_diff)
            end
        end
        point.fl_time = fl_time
        prev_point = point
      end
    end
  end

  def self.process_file(data, extension, track_index)
    parser = ParserSelector.choose(data, extension)
    return nil if parser.nil?

    if parser.is_a? FlySightParser
      gps_type = :flysight
    elsif parser.is_a? ColumbusParser
      gps_type = :columbus
    elsif parser.is_a? TESParser
      gps_type = :wintec
    elsif parser.is_a? GPXParser
      gps_type = :gpx
    end

    tp_processor = TPProcessor.new(parser.parse track_index)
    { gps_type: gps_type, points: tp_processor.process }
  end
end
