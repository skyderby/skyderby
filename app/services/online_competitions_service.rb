class OnlineCompetitionsService
  def initialize(track)
    @track = track
  end

  def execute
    track.delete_online_competitions_results

    competitions = OnlineEventsFinder.new(track).execute
    competitions.each do |competition|
      score_track_in_competition(competition)
    end
  end

  private

  attr_reader :track

  def score_track_in_competition(competition)
    track_segment =
      WindowRangeFinder.new(track_points).execute(competition.window_params)

    track.virtual_comp_results.create(
      virtual_competition_id: competition.id,
      result: track_segment.public_send(competition.task),
      highest_gr: track_segment.max_gr,
      highest_speed: track_segment.max_ground_speed
    )
  rescue WindowRangeFinder::ValueOutOfRange
    return
  end

  def track_points
    @track_points ||= begin
      raw_points = PointsQuery.execute(
        track,
        trimmed: { seconds_before_start: 20 },
        only: [:gps_time, :altitude, :latitude, :longitude, :h_speed, :v_speed, :glide_ratio]
      )

      PointsPostprocessor.for(track.gps_type).new(raw_points).execute
    end
  end
end
