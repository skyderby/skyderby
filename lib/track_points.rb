
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

    track_points = @points
    if @ff_start.present?
       track_points = track_points.drop_while{ |x| x[:fl_time_abs] < @ff_start}
    end
    if @ff_end.present? && @ff_end > 0 && (@ff_start.blank? || @ff_end > @ff_start)
      track_points = track_points.reverse.drop_while{ |x| x[:fl_time_abs] > @ff_end}.reverse
    end

    track_points

  end

  def min_h
    @points.min_by { |x| x[:elevation] }[:elevation]
  end

  def max_h
    @points.max_by { |x| x[:elevation] }[:elevation]
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