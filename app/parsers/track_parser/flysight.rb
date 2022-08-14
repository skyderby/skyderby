require 'csv'

module TrackParser
  class Flysight
    FIELDS_INDEXES = {
      time: 0,
      latitude: 1,
      longitude: 2,
      altitude: 3,
      speed_north: 4,
      speed_east: 5,
      speed_vertical: 6,
      horizontal_accuracy: 7,
      vertical_accuracy: 8,
      speed_accuracy: 9,
      heading: 10,
      heading_accuracy: 11,
      gps_fix: 12,
      number_of_satellites: 13
    }.freeze

    MS_IN_KMH = 3.6

    def initialize(args = {})
      @file = args[:file]
    end

    def parse
      track_points = []
      CSV.new(file.open).each do |row|
        next unless row[FIELDS_INDEXES[:time]].to_s.match?(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)

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
        r.heading = row[FIELDS_INDEXES[:heading]]
        r.heading_accuracy = row[FIELDS_INDEXES[:heading_accuracy]]
        r.gps_fix = row[FIELDS_INDEXES[:gps_fix]]
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
