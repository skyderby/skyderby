class ResultsCalculator

  attr_reader :track, :range_from, :range_to

  def initialize(track, range_from, range_to)
    @track = track
    @range_from = range_from
    @range_to = range_to
  end

  def calc_results

    fl_time = 0
    distance = 0

    is_first = true
    prev_point = nil

    track_points = get_track_data
    track_points.each do |current_point|

      is_last = true

      if current_point[:elevation] <= @range_from && current_point[:elevation] >= @range_to

        is_last = false

        if is_first
          is_first = false
          if current_point[:elevation] != @range_from && prev_point.present?
            elev_diff = @range_from - current_point[:elevation]
            k = elev_diff / current_point[:elevation_diff]
            fl_time = (current_point[:fl_time] * k).round(1)
            distance = (current_point[:distance] * k).round(0)
          end
          next
        end

        fl_time += current_point[:fl_time].round(1)
        distance += current_point[:distance].round(0)

      end

      if is_last && fl_time > 0
        if current_point[:elevation] <= @range_to
          elev_diff = prev_point[:elevation] - @range_to
          k = elev_diff / current_point[:elevation_diff]
          fl_time += (current_point[:fl_time] * k).round(1)
          distance += (current_point[:distance] * k).round(0)
        end
        break
      end

      prev_point = current_point

    end

    {:fl_time => fl_time.round(1),
     :distance => distance.round(0),
     :speed => Velocity.to_kmh(distance / fl_time).round(0)}

  end

end