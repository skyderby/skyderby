module Landing
  class FeaturedTrack
    ENTRIES = {
      'primary' => 'kings_1st.csv',
      'compare' => 'kings_5th.csv'
    }.freeze

    MS_IN_KMH = 3.6

    def self.find(key)
      file = ENTRIES[key.to_s]
      file && new(key.to_s, file)
    end

    attr_reader :key

    def initialize(key, file)
      @key = key
      @file = file
    end

    def points
      @points ||= Rails.cache.fetch(cache_key) { build_points }
    end

    private

    def cache_key
      "landing/featured_track/#{key}/points/#{Digest::MD5.file(path).hexdigest}"
    end

    def path
      Rails.root.join('config', 'landing', @file)
    end

    def parser_format
      File.foreach(path).first.to_s.start_with?('$FLYS') ? :flysight2 : :flysight
    end

    def records
      @records ||= PointsProcessor.for(parser_format).new(parsed_records).execute
    end

    def parsed_records
      TrackParser.for(parser_format).new(file: path).parse
    end

    def flight_records
      segments = Track::Segments.new(records)
      records[index_of(segments.exit_point)..index_of(segments.deploy_point)]
    end

    def index_of(point)
      records.find_index { |record| record.equal?(point) }
    end

    def build_points # rubocop:disable Metrics/AbcSize
      flight = flight_records
      started_at = flight.first.fl_time

      flight.map do |record|
        h_speed = record.h_speed.to_f / MS_IN_KMH
        v_speed = record.v_speed.to_f / MS_IN_KMH

        {
          fl_time: record.fl_time - started_at,
          abs_altitude: record.abs_altitude.to_f,
          altitude: record.abs_altitude.to_f,
          h_speed: h_speed,
          v_speed: v_speed,
          full_speed: Math.sqrt((h_speed**2) + (v_speed**2)),
          glide_ratio: v_speed.zero? ? 0.0 : h_speed / v_speed,
          horizontal_accuracy: record.horizontal_accuracy.to_f,
          vertical_accuracy: record.vertical_accuracy.to_f,
          speed_accuracy: record.speed_accuracy.to_f,
          latitude: record.latitude.to_f,
          longitude: record.longitude.to_f,
          gps_time: record.gps_time
        }
      end
    end
  end
end
