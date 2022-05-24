module Place::Stats
  extend ActiveSupport::Concern

  def popular_times
    Place
      .select(
        'g.month',
        'COALESCE(COUNT(id), 0) AS track_count',
        'COALESCE(COUNT(DISTINCT profile_id), 0) AS people_count'
      )
      .from('generate_series(1, 12) AS g(month)')
      .joins(<<~JOIN.squish)
        LEFT JOIN tracks
        ON EXTRACT('month' from tracks.recorded_at) = g.month
        AND tracks.place_id = #{id}
      JOIN
      .group('g.month')
  end

  def last_track_recorded_at = tracks.order(recorded_at: :desc).limit(1).pick(:recorded_at)
end
