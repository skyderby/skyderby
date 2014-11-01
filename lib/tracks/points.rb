class TrackPoints

  attr_reader :points

  def initialize(track = nil)

    raise ArgumentError.new('Track must be present') if track.nil?

    @points = []
    @ff_start = 0
    @ff_end = 0

    read(track)

  end

  def trimmed

    track_points = @points.clone
    if @ff_start.present?
       track_points = track_points.drop_while{ |x| x[:fl_time_abs] < @ff_start}
    end
    if @ff_end.present? && @ff_end > 0 && (@ff_start.blank? || @ff_end > @ff_start)
      track_points = track_points.reverse.drop_while{ |x| x[:fl_time_abs] > @ff_end}.reverse
    end

    track_points

  end

  def trim_interpolize(range_from, range_to)

    track_points = []
    is_first = true
    prev_point = nil

    @points.each do |curr|

      current_point = curr.clone

      is_last = true

      if current_point[:elevation] <= range_from && current_point[:elevation] >= range_to

        is_last = false

        if is_first

          is_first = false

          if current_point[:elevation] != range_from && prev_point.present?
            elev_diff = range_from - current_point[:elevation]
            k = elev_diff / current_point[:elevation_diff]
            current_point[:fl_time] = (current_point[:fl_time] * k).round(1)
            current_point[:distance] = (current_point[:distance] * k).round(0)
            current_point[:elevation_diff] = elev_diff

            track_points << current_point

          end

          next

        end

        track_points << current_point

      end

      if is_last && !track_points.empty?
        if current_point[:elevation] <= range_to
          elev_diff = prev_point[:elevation] - range_to
          k = elev_diff / current_point[:elevation_diff]
          current_point[:fl_time] = (current_point[:fl_time] * k).round(1)
          current_point[:distance] = (current_point[:distance] * k).round(0)
          current_point[:elevation_diff] = elev_diff

          track_points << current_point

        end
        break
      end

      prev_point = current_point

    end

    track_points

  end

  def min_h
    trimmed.min_by { |x| x[:elevation] }[:elevation]
  end

  def max_h
    trimmed.max_by { |x| x[:elevation] }[:elevation]
  end

  private

  def read(track)

    @ff_start = track.ff_start
    @ff_end = track.ff_end

    read_points(track)

  end

  def read_points(track)

    points = Point.joins(:tracksegment).where('tracksegments.track_id' => track.id).to_a

    prev_point = nil
    fl_time = 0

    points.each do |point|
      if prev_point != nil

        fl_time_diff = point.point_created_at - prev_point.point_created_at
        fl_time += fl_time_diff

        @points << {:fl_time => fl_time_diff,
                    :fl_time_abs => fl_time,
                    :elevation_diff => (prev_point.elevation - point.elevation).round(2),
                    :elevation => point.elevation.round(2),
                    :abs_altitude => point.abs_altitude,
                    :latitude => point.latitude,
                    :longitude => point.longitude,
                    :distance => point.distance.to_i,
                    :h_speed => point.h_speed.round(2),
                    :v_speed => point.v_speed.round(2),
                    :glrat => (point.h_speed.round(2) / point.v_speed.round(2)).round(2)
        }

      end
      prev_point = point
    end

  end

end