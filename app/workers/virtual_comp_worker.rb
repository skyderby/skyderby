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
        result_hash = calculate_distance_in_time(data, comp.discipline_parameter)
        tmp_result.result = result_hash[:distance]
        tmp_result.highest_gr = result_hash[:highest_gr] if comp.display_highest_gr
        tmp_result.highest_speed = result_hash[:highest_speed] if comp.display_highest_speed
      else
        result_hash = calculate(data, comp.range_from, comp.range_to)
        tmp_result.result = result_hash[:distance] if comp.distance?
        tmp_result.result = result_hash[:speed] if comp.speed?
        tmp_result.result = result_hash[:time] if comp.time?
      end
      track.virtual_comp_results << tmp_result if tmp_result.result > 0
    end
  end

  def calculate_distance_in_time(data, discipline_parameter)
    # method return values
    distance = 0
    highest_gr = 0
    highest_speed = 0

    # tmp values
    fl_time = 0
    prev_point = nil
    start_found = false
    trk_points = data.trimmed(start: data.ff_start - 10)

    trk_points.each do |cur_point|
      break if fl_time >= discipline_parameter
      # break if track trimmed to point after exit
      break if !prev_point && cur_point[:raw_v_speed] > 10

      if prev_point
        if cur_point[:raw_v_speed] >= 10 && !start_found
          start_found = true
          k = (cur_point[:raw_v_speed] - 10) / (cur_point[:raw_v_speed] - prev_point[:raw_v_speed])
          fl_time += cur_point[:fl_time] * k
          distance += cur_point[:distance] * k
        end

        if start_found
          if fl_time + cur_point[:fl_time] < discipline_parameter
            fl_time += cur_point[:fl_time]
            distance += cur_point[:distance]

            highest_gr = cur_point[:glrat] if cur_point[:glrat] > highest_gr
            highest_speed = cur_point[:h_speed] if cur_point[:h_speed] > highest_speed
          else
            k = (fl_time + cur_point[:fl_time] - discipline_parameter) / cur_point[:fl_time]
            fl_time += cur_point[:fl_time] - cur_point[:fl_time] * k
            distance += cur_point[:distance] - cur_point[:distance] * k
          end
        end
      end

      prev_point = cur_point
    end

    { distance: distance, highest_gr: highest_gr, highest_speed: highest_speed }
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
