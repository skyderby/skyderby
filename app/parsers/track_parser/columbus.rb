module TrackParser
  class Columbus
    # Column indexes
    INDEX     = 0
    TAG       = 1
    DATE      = 2
    TIME      = 3
    LATITUDE  = 4
    LONGITUDE = 5
    ALTITUDE  = 6
    SPEED     = 7
    HEADING   = 8
    VOX       = 9

    # Coordinates suffixes
    NORTH = 'N'.freeze
    SOUTH = 'S'.freeze
    EAST  = 'E'.freeze
    WEST  = 'W'.freeze

    def initialize(args = {})
      @file = args[:file]
    end

    def parse
      track_points = []
      CSV.new(file.open, skip_lines: /^INDEX/).each do |row|
        next if row[ALTITUDE].to_f.zero?

        track_points << parse_row(row)
      end

      track_points
    end

    private

    attr_reader :file

    def parse_row(row)
      PointRecord.new.tap do |r|
        r.latitude     = parse_coordinate row[LATITUDE]
        r.longitude    = parse_coordinate row[LONGITUDE]
        r.abs_altitude = BigDecimal(row[ALTITUDE])
        r.gps_time = parse_datetime(date: row[DATE], time: row[TIME])
      end
    end

    def parse_coordinate(coordinate_str)
      suffix = coordinate_str[-1]
      value = BigDecimal(coordinate_str[0..-2])

      [SOUTH, WEST].include?(suffix) ? -value : value
    end

    def parse_datetime(date:, time:)
      Time.strptime("#{date}T#{time} UTC", '%y%m%dT%H%M%S %Z')
    end
  end
end
