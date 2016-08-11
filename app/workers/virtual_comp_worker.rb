class VirtualCompWorker
  include Sidekiq::Worker

  def perform(track_id)
    track = Track.find_by_id(track_id)
    return unless track

    track.virtual_comp_results.each(&:delete)
    return unless track_valid? track

    data = Skyderby::Tracks::Points.new(track)

    competitions = OnlineEventsFinder.new.execute(track)
    competitions.each do |comp|
      opts = collect_options comp, track
      points = comp.skydive? ? data.trimmed : data
      result = process_track points, opts
      track.virtual_comp_results << result if result_valid?(result)
    end
  end

  def track_valid?(track)
    track.public_track? && track.wingsuit && track.pilot
  end

  def collect_options(comp, track)
    opts = {
      discipline: comp.discipline.to_sym,
      competition_id: comp.id,
      profile_id: track.profile_id,
      is_flysight: track.flysight?,
      calc_highest_gr: comp.display_highest_gr,
      calc_highest_speed: comp.display_highest_speed
    }
    opts[:time] = comp.discipline_parameter if comp.distance_in_time?
    opts[:altitude] = comp.discipline_parameter if comp.distance_in_altitude?

    if comp.skydive?
      opts[:range_from] = comp.range_from
      opts[:range_to] = comp.range_to
    end

    opts
  end

  def process_track(data, opts)
    result = Skyderby::ResultsProcessor.new(data, opts[:discipline], opts).execute

    comp_result = VirtualCompResult.new
    comp_result.profile_id = opts[:profile_id]
    comp_result.virtual_competition_id = opts[:competition_id]

    if result.is_a? Hash
      comp_result.result = result[:result]
      comp_result.highest_gr = result[:highest_gr] if opts[:calc_highest_gr]
      comp_result.highest_speed = result[:highest_speed] if opts[:calc_highest_speed]
    else
      comp_result.result = result
    end

    comp_result
  end

  def result_valid?(comp_result)
    comp_result.result.is_a?(Numeric) && comp_result.result > 0
  end
end
