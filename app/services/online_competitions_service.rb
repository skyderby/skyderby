class OnlineCompetitionsService
  def initialize(track)
    @track = track
  end

  def execute
    track.delete_online_competitions_results

    competitions = VirtualCompetition.suitable_for(track)
    competitions.each do |competition|
      score_track_in_competition(competition)
    end
  end

  private

  attr_reader :track

  def score_track_in_competition(competition)
    if competition.flare?
      flares = Tracks::FlaresDetector.call(track_points)
      return unless flares.any?

      highest_flare = flares.max_by(&:altitude_gain)

      competition.results.create(
        track: track,
        result: highest_flare.altitude_gain
      )
    else
      points = track_points(trimmed: { seconds_before_start: 10 })

      track_segment =
        WindowRangeFinder.new(points).execute(competition.window_params)

      competition.results.create(
        track: track,
        result: track_segment.public_send(competition.task),
        highest_gr: track_segment.max_gr,
        highest_speed: track_segment.max_ground_speed
      )
    end
  rescue WindowRangeFinder::ValueOutOfRange, PathIntersectionFinder::IntersectionNotFound => e
    Rails.logger.info("Failed to calc online competition result beacause of error #{e}")
  end

  def track_points(trimmed: true)
    raw_points = PointsQuery.execute(
      track,
      trimmed: trimmed,
      only: [:gps_time, :altitude, :latitude, :longitude, :h_speed, :v_speed, :glide_ratio]
    )

    PointsPostprocessor.for(track.gps_type).call(raw_points)
  end
end
