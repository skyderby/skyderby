module Event::Result::ExitDetails
  extend ActiveSupport::Concern

  class_methods do
    def with_exit_details
      track_ids = pluck(:track_id)

      query =
        Point
        .select(
          :track_id,
          'to_timestamp(MIN(points.gps_time_in_seconds) + tracks.ff_start) AT TIME ZONE \'UTC\' AS start_time',
          'MAX(points.abs_altitude) + COALESCE(places.msl, tracks.ground_level) AS exit_altitude'
        )
        .left_joins(track: :place)
        .joins(<<~SQL.squish)
          INNER JOIN (#{start_times_query(track_ids).to_sql}) AS start_times
          ON points.track_id = start_times.track_id
            AND points.gps_time_in_seconds >= start_times.gps_time_in_seconds + tracks.ff_start
        SQL
        .where(track_id: track_ids)
        .group(
          'points.track_id',
          'start_times.gps_time_in_seconds',
          'places.id',
          'tracks.id'
        )

      joins(<<~SQL.squish)
        LEFT JOIN (#{query.to_sql}) AS exit_details
        ON event_results.track_id = exit_details.track_id
      SQL
        .select(
          'event_results.*',
          'exit_details.start_time',
          'exit_details.exit_altitude'
        )
    end

    def start_times_query(ids)
      Point
        .select(:track_id, 'MIN(gps_time_in_seconds) AS gps_time_in_seconds')
        .where(track_id: ids)
        .group(:track_id)
    end
  end
end
