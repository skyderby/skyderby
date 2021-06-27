module TrackParser
  class Columbus
    FIELDS_INDEXES = {
      index: 0,
      tag: 1,
      date: 2,
      time: 3,
      latitude: 4,
      longitude: 5,
      altitude: 6,
      speed: 7,
      heading: 8,
      vox: 9
    }.freeze

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
        next if row[FIELDS_INDEXES[:altitude]].to_f.zero?

        track_points << parse_row(row)
      end

      track_points
    end

    private

    attr_reader :file

    def parse_row(row)
      PointRecord.new.tap do |r|
        r.latitude     = parse_coordinate row[FIELDS_INDEXES[:latitude]]
        r.longitude    = parse_coordinate row[FIELDS_INDEXES[:longitude]]
        r.abs_altitude = BigDecimal(row[FIELDS_INDEXES[:altitude]])
        r.heading = row[FIELDS_INDEXES[:heading]]
        r.gps_time = parse_datetime(date: row[FIELDS_INDEXES[:date]], time: row[FIELDS_INDEXES[:time]])
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
