class ResultsWorker
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(track_id)
    track = Track.find(track_id)
    data = TrackPoints.new(track)
    is_skydive = track.kind == Track.kinds[:skydive]

    track.track_results.each(&:delete)

    ff_start_elev = find_ff_start_elev(data.points, track.ff_start, is_skydive)
    ff_end_elev = find_ff_end_elev(data.points, track.ff_end, is_skydive)

    results = []
    ff_range = ff_start_elev - ff_end_elev
    if is_skydive && ff_range > 1000
      steps = ((ff_range - 1000) / 50).floor

      steps.times do |s|
        res_range_from = ff_start_elev - 50 * s
        res_range_to = ff_start_elev - 1000 - 50 * s

        results << calculate(data, res_range_from, res_range_to)
      end
    else
      results << calculate(data, ff_start_elev, ff_end_elev)
    end

    return if results.count == 0
    time = results.max_by { |x| x[:time] }
    track.track_results << TrackResult.new(discipline: :time,
                                           range_from: time[:range_from],
                                           range_to: time[:range_to],
                                           result: time[:time])

    distance = results.max_by { |x| x[:distance] }
    track.track_results << TrackResult.new(discipline: :distance,
                                           range_from: distance[:range_from],
                                           range_to: distance[:range_to],
                                           result: distance[:distance])

    speed = results.max_by { |x| x[:speed] }
    track.track_results << TrackResult.new(discipline: :speed,
                                           range_from: speed[:range_from],
                                           range_to: speed[:range_to],
                                           result: speed[:speed])
  end
  
  def calculate(data, range_from, range_to)
    trk_points = data.trim_interpolize(range_from, range_to)
    fl_time = trk_points.map { |x| x[:fl_time] }.inject(0, :+)
    distance = trk_points.map { |x| x[:distance] }.inject(0, :+)
    speed = fl_time.zero? ? 0 : Velocity.to_kmh(distance / fl_time).round

    # fl_time = 0 if fl_time > 300
    # distance = 0 if distance > 9900
    # speed = 0 if speed > 500

    {
      range_from: range_from,
      range_to: range_to,
      time: fl_time.round(1),
      distance: distance.round,
      speed: speed
    }
  end

  def find_ff_start_elev(points, ff_start, is_skydive)
    ff_start_elev = points.max_by { |x| x[:elevation] }[:elevation]

    unless ff_start.nil? || ff_start.zero?
      ff_start_elev = 
        points.find do |x| 
          x[:fl_time_abs] > ff_start 
        end[:elevation] 
    end

    if is_skydive 
      ff_start_elev -= ff_start_elev % 50
    else 
      ff_start_elev
    end
  end

  def find_ff_end_elev(points, ff_end, is_skydive)
    ff_end_elev = is_skydive ? 1000 : 100

    if ff_end
      ff_end_elev = 
        points.find do |x| 
          x[:fl_time_abs] > ff_end 
        end[:elevation]
    end

    if is_skydive
      ff_end_elev += 50 - ff_end_elev % 50
    else
      ff_end_elev
    end
  end
end
