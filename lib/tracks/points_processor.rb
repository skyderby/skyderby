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

      filter_by_freq!
      corr_elevation!
      calc_parameters!

      @points
    end

    private

    # Приведение прочитанных данных к формату 1 Гц
    def filter_by_freq!
      @points.uniq!{ |x| DateTime.strptime(x[:point_created_at], '%Y-%m-%dT%H:%M:%S') }
    end

    # Корректировка высоты от уровня земли
    def corr_elevation!
      min_height = @points.min_by { |x| x[:elevation] }[:elevation]
      @points.each do |x|
        x[:elevation] -= min_height
      end
    end

    def calc_parameters!
      prev_point = nil
      fl_time = 0

      @points.each do |point|
        point[:distance] = 0 if prev_point.nil?
        point[:point_created_at] = DateTime.strptime(point[:point_created_at], '%Y-%m-%dT%H:%M:%S')
        unless prev_point.nil?
          fl_time_diff = (point[:point_created_at] - prev_point[:point_created_at]) * 1.days
          fl_time += fl_time_diff

          point[:distance] = Geospatial.distance [prev_point[:latitude], prev_point[:longitude]], [point[:latitude], point[:longitude]]
          point[:h_speed] = Velocity.to_kmh(point[:distance] / fl_time_diff)
          point[:v_speed] = Velocity.to_kmh((prev_point[:elevation] - point[:elevation]) / fl_time_diff)
        end
        point[:fl_time] = fl_time
        prev_point = point
      end
    end
  end

  def self.process_file(data, extension, track_index)
    parser = ParserSelector.choose(data, extension)
    return nil if parser.nil?

    tp_processor = TPProcessor.new(parser.parse track_index)
    tp_processor.process
  end
end