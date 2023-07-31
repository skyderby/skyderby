require 'csv'

module TrackParser
  class Flysight2
    FIELDS_INDEXES = {
      time: 1,
      latitude: 2,
      longitude: 3,
      altitude: 4,
      speed_north: 5,
      speed_east: 6,
      speed_vertical: 7,
      horizontal_accuracy: 8,
      vertical_accuracy: 9,
      speed_accuracy: 10,
      number_of_satellites: 11
    }.freeze

    MS_IN_KMH = 3.6

    def initialize(args = {})
      @file = args[:file]
    end

    def parse
      track_points = []
      CSV.new(file.open).each do |row|
        next unless row[0].to_s == '$GNSS'

        track_points << parse_row(row)
      end

      track_points
    end

    private

    attr_reader :file

    def parse_row(row) # rubocop:disable Metrics/AbcSize
      PointRecord.new.tap do |r|
        r.gps_time = gps_time(row[FIELDS_INDEXES[:time]].to_s)
        r.latitude = BigDecimal(row[FIELDS_INDEXES[:latitude]]).truncate(10)
        r.longitude = BigDecimal(row[FIELDS_INDEXES[:longitude]]).truncate(10)
        r.abs_altitude = BigDecimal(row[FIELDS_INDEXES[:altitude]]).truncate(3)
        r.h_speed = ground_speed_from_components(
          north: row[FIELDS_INDEXES[:speed_north]],
          east: row[FIELDS_INDEXES[:speed_east]]
        )
        r.v_speed = vertical_speed(row[FIELDS_INDEXES[:speed_vertical]])
        r.horizontal_accuracy = row[FIELDS_INDEXES[:horizontal_accuracy]]
        r.vertical_accuracy = row[FIELDS_INDEXES[:vertical_accuracy]]
        r.speed_accuracy = row[FIELDS_INDEXES[:speed_accuracy]]
        r.number_of_satellites = row[FIELDS_INDEXES[:number_of_satellites]]
      end
    end

    def ground_speed_from_components(north:, east:)
      Math.sqrt((north.to_f**2) + (east.to_f**2)) * MS_IN_KMH
    end

    def vertical_speed(value)
      value.to_f * MS_IN_KMH
    end

    def gps_time(time_str)
      Time.strptime(time_str, '%Y-%m-%dT%H:%M:%S.%L %Z')
    end
  end
end
