##
# Query object for track points
#
# Arguments:
# - track (required) - instance of Track model, track which points will be queried
# - opts (optional) - Hash with following available options:
#   - freq_1Hz - Boolean. True to select one point per second, false or all points
#   - trimmed - Boolean or Hash with trim options:
#     - seconds_before_start
#   - only - array of column names to query
#
#  Columns:
#  - gps_time     - time recorded by device. Timezone - UTC
#  - fl_time      - relative time from start of track
#  - abs_altitude - absolute altitude recorded by device
#  - altitude     - altitude relative to ground
#  - latitude     - latitude
#  - longitude    - longitude
#  - h_speed      - horizontal speed in km/h
#  - v_speed      - vertical speed in km/h
#  - distance     - distance covered from previous point
#  - time_diff    - difference in time from previous point
#  - glide_ratio  - horizontal speed divided by vertical speed
#
# Examples:
#
# Query points from 20 sec before flight start. Only columns:
#   - gps_time
#   - altitude
#   - latitude
#   - longitude
#
# PointsQuery.execute(
#   track,
#   trimmed: { seconds_before_start: 20 },
#   only: %i[gps_time altitude latitude longitude]
# )
#
class PointsQuery
  def initialize(track, opts = {})
    @track = track
    @query_opts = opts.slice(:only, :freq_1Hz)
    @freq_1Hz   = opts[:freq_1Hz] || false
    @trimmed    = opts[:trimmed] || false
    @trim_options = trimmed.is_a?(Hash) ? trimmed : {}
  end

  def execute
    points = scope.pluck_to_hash(*select_columns)
    calc_time_diff points
  end

  private

  attr_reader :track, :query_opts, :trimmed, :trim_options, :freq_1Hz

  def scope
    collection = track.points

    if trimmed
      ff_start, ff_end = Track.where(id: track.id).pluck(:ff_start, :ff_end).first
      ff_start -= trim_options[:seconds_before_start] if trim_options[:seconds_before_start]

      collection = collection.where('fl_time BETWEEN ? AND ?', ff_start, ff_end)
    end

    collection = collection.reorder('floor(gps_time_in_seconds), gps_time_in_seconds') if freq_1Hz
    collection
  end

  def select_columns
    QueryBuilder.new(track, query_opts).execute
  end

  def calc_time_diff(points)
    return points unless time_diff_selected

    points.tap do |tmp|
      tmp.each_cons(2) do |prev, cur|
        cur[:time_diff] = cur[:gps_time] - prev[:gps_time]
      end
    end
  end

  def time_diff_selected
    query_opts[:only].blank? || query_opts[:only].include?(:time_diff)
  end

  class << self
    def execute(*args)
      new(*args).execute
    end
  end

  class QueryBuilder
    COLUMNS = {
      gps_time:     'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
      fl_time:      -> { "gps_time_in_seconds - #{start_time_in_seconds} AS fl_time" },
      abs_altitude: :abs_altitude,
      altitude:     -> { "#{track.point_altitude_field} AS altitude" },
      latitude:     :latitude,
      longitude:    :longitude,
      h_speed:      :h_speed,
      v_speed:      :v_speed,
      distance:     :distance,
      time_diff:    '0 AS time_diff',
      glide_ratio:  'CASE WHEN v_speed = 0 THEN h_speed / 0.1 ELSE h_speed / ABS(v_speed) END AS glide_ratio'
    }.with_indifferent_access.freeze

    def initialize(track, opts = {})
      @track = track
      @only_columns = opts[:only]
      @freq_1Hz = opts[:freq_1Hz] || false
    end

    def execute
      select_statements = select_columns.map do |_key, statement|
        statement = instance_exec(&statement) if statement.is_a? Proc
        statement
      end

      return select_statements unless freq_1Hz

      select_statements.tap do |statements|
        statements[0] = 'DISTINCT ON (floor(gps_time_in_seconds)) ' + statements.first
      end
    end

    private

    attr_reader :track, :only_columns, :freq_1Hz

    def select_columns
      return COLUMNS unless only_columns
      COLUMNS.slice(*only_columns)
    end

    def start_time_in_seconds
      track.points.first&.gps_time_in_seconds.to_f
    end
  end
end
