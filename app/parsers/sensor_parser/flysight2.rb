module SensorParser
  class Flysight2
    GPS_EPOCH = Time.utc(1980, 1, 6).to_i
    SECONDS_IN_WEEK = 604_800

    Sample = Data.define(:gps_time, :ax, :ay, :az) do
      def vector = [ax, ay, az]
    end

    def self.sensor_file?(io)
      head = io.read(4.kilobytes).to_s
      io.rewind
      head.include?('$COL,IMU')
    end

    def initialize(io)
      @io = io
    end

    def samples
      @samples ||= build_samples
    end

    private

    attr_reader :io

    def build_samples
      imu_rows, clock_offsets = read_rows
      return [] if clock_offsets.empty?

      offset = clock_offsets.sort[clock_offsets.size / 2]
      imu_rows.sort_by(&:first).map { |time, ax, ay, az| Sample.new(gps_time: time + offset, ax:, ay:, az:) }
    end

    def read_rows
      columns = {}
      imu_rows = []
      clock_offsets = []

      io.each_line do |line|
        row = line.chomp.split(',')
        case row[0]
        when '$COL' then columns[row[1]] = row[2..]
        when '$IMU' then imu_rows << imu_values(row, columns['IMU'])
        when '$TIME' then clock_offsets << clock_offset(row, columns['TIME'])
        end
      end

      [imu_rows, clock_offsets]
    end

    def imu_values(row, columns)
      %w[time ax ay az].map { |name| row[columns.index(name) + 1].to_f }
    end

    def clock_offset(row, columns)
      time, tow, week = %w[time tow week].map { |name| row[columns.index(name) + 1].to_f }
      GPS_EPOCH + (week * SECONDS_IN_WEEK) + tow - time
    end
  end
end
