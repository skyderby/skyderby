class VirtualCompWorker
  include Sidekiq::Worker

  def perform(track_id)
    track = Track.find(track_id)
    track.virtual_comp_results.each(&:delete)
    return unless track.wingsuit && track.pilot

    data = TrackPoints.new(track)

    competitions = VirtualCompetition.by_track(track)
    competitions.each do |comp|
      tmp_result = VirtualCompResult.new
      tmp_result.user_profile_id = track.user_profile_id
      tmp_result.virtual_competition_id = comp.id

      if comp.distance_in_time?
        tmp_result.result = calculate_distance_in_time(data, comp.discipline_parameter)
      else
        result_hash = calculate(data, comp.range_from, comp.range_to)
        tmp_result.result = result_hash[:distance] if comp.distance?
        tmp_result.result = result_hash[:speed] if comp.speed?
        tmp_result.result = result_hash[:time] if comp.time?
      end
      track.virtual_comp_results << tmp_result
    end
  end

  def calculate_distance_in_time(data, discipline_parameter)
    trk_points = data.trimmed  
    fl_time = 0
    distance = 0
    trk_points.each do |x|
      fl_time += x[:fl_time]
      next if fl_time == 1 
      distance += x[:distance]
      break if fl_time > 20 
    end
    distance
  end

  # REFACTOR THIS
  def calculate(data, range_from, range_to)
    trk_points = data.trim_interpolize(range_from, range_to)
    fl_time = trk_points.map { |x| x[:fl_time] }.inject(0, :+)
    distance = trk_points.map { |x| x[:distance] }.inject(0, :+)
    speed = fl_time.zero? ? 0 : Velocity.to_kmh(distance / fl_time).round

    {
      range_from: range_from,
      range_to: range_to,
      time: fl_time.round(1),
      distance: distance.round,
      speed: speed
    }
  end
end
