require 'tracks/results/result.rb'

class ResultsWorker
  include Sidekiq::Worker

  def perform(track_id)
    track = Track.find_by_id(track_id)
    return unless track

    data = Skyderby::Tracks::Points.new(track)
    is_skydive = track.skydive?

    track.track_results.each(&:delete)

    ff_start_elev = find_ff_start_elev(data.points, track.ff_start, is_skydive)
    ff_end_elev = find_ff_end_elev(data.points, track.ff_end, is_skydive)

    results = []
    ff_range = ff_start_elev - ff_end_elev
    if is_skydive && ff_range > 1000
      steps = ((ff_range - 1000) / 50).floor

      steps.times do |s|
        range = {
          range_from: ff_start_elev - 50 * s,
          range_to: ff_start_elev - 1000 - 50 * s
        }

        results << calculate(data.trimmed, range)
      end
    else
      range = {
        range_from: ff_start_elev,
        range_to: ff_end_elev
      }
      results << calculate(data.points, range)
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

  # REFACTOR THIS
  def calculate(data, range)
    TrackResultData.new(
      range_from: range[:range_from],
      range_to: range[:range_to],
      time: Skyderby::ResultsProcessor.new(data, :time, range).execute,
      distance: Skyderby::ResultsProcessor.new(data, :distance, range).execute,
      speed: Skyderby::ResultsProcessor.new(data, :speed, range).execute
    )
  end

  def find_ff_start_elev(points, ff_start, is_skydive)
    ff_start_elev = points.max_by { |x| x[:elevation] }[:elevation]

    unless ff_start.nil? || ff_start.zero?
      ff_start_elev =
        points.find do |x|
          x[:fl_time_abs] >= ff_start
        end[:elevation]
    end

    ff_start_elev -= ff_start_elev % 50 if is_skydive
    ff_start_elev
  end

  def find_ff_end_elev(points, ff_end, is_skydive)
    ff_end_elev = is_skydive ? 1000 : 100

    if ff_end
      end_point = points.find { |x| x[:fl_time_abs] >= ff_end }
      ff_end_elev = [ff_end_elev, end_point[:elevation]].max if end_point
    end

    ff_end_elev += 50 - ff_end_elev % 50 if is_skydive
    ff_end_elev
  end
end
