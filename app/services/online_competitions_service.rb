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
    @track_points ||=
      track.points
           .trimmed(seconds_before_start: 20)
           .pluck_to_hash(
             'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
             "#{@track.point_altitude_field} AS altitude",
             :latitude,
             :longitude,
             'h_speed AS h_speed',
             'v_speed AS v_speed',
             'CASE WHEN v_speed = 0 THEN h_speed / 0.1
                   ELSE h_speed / ABS(v_speed)
             END AS glide_ratio'
           )
  end
end
