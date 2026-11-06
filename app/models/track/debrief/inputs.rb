class Track::Debrief::Inputs
  MAX_REFERENCES = 3
  MAX_THRESHOLDS = 3
  TOP_STANDINGS = 10
  NEIGHBOURS = 3
  MAX_PILOT_JUMPS = 20

  def self.digest(inputs) = Digest::SHA256.hexdigest([Track::Debrief::Prompt::VERSION, inputs.to_json].join)

  attr_reader :track, :discipline, :field

  def initialize(track, discipline)
    @track = track
    @discipline = discipline
    @field = Track::Debrief::Field.new(discipline, year: track.recorded_at.year)
  end

  def fingerprint = [Track::Debrief::Prompt::VERSION, field.fingerprint].join(':')

  def to_h
    @to_h ||= {
      'discipline' => discipline_info,
      'pilot' => pilot_info,
      'jump' => jump_info,
      'standings' => standings_excerpt.map { |standing| standing_row(standing) },
      'thresholds' => thresholds,
      'references' => references,
      'pilot_jumps' => pilot_jumps
    }
  end

  private

  def parts = discipline.parts

  def discipline_info
    discipline.to_h.merge(
      'season' => field.year,
      'field_size' => field.standings.size,
      'parts' => parts.each_with_index.map do |part, index|
        best = field.bests[index]
        part.to_h.merge(
          'key' => part.discipline,
          'season_best' => best&.round(1),
          'points_per_unit' => best.to_f.positive? ? (100 / best).round(3) : nil
        )
      end
    )
  end

  def own_standing = @own_standing ||= field.standings.find { |standing| standing.profile_id == track.profile_id }

  def pilot_info
    {
      'name' => track.pilot&.name,
      'rank' => own_standing&.rank,
      'total' => own_standing&.total&.round(1),
      'counted_track_id' => own_standing&.track_id
    }
  end

  def jump_info
    {
      'track_id' => track.id, 'date' => track.recorded_at.to_date.iso8601, 'place' => track.place&.name,
      'suit' => track.suit&.name, 'counted' => own_standing&.track_id == track.id, **scores
    }
  end

  def scores
    {
      'results' => results_hash(jump_results),
      'total' => field.total_for(jump_results).round(1),
      'part_ranks' => part_ranks,
      'metrics' => own_metrics.to_h
    }
  end

  def jump_results
    @jump_results ||= (discipline.chosen_window? ? nil : field.results_for(track.id)) ||
                      parts.map { |part| measured_result(part) }
  end

  def measured_result(part)
    part.window? ? own_metrics.window&.dig('result') : own_metrics.flare&.dig('gain')
  end

  def own_metrics = @own_metrics ||= metrics_for(track)

  def results_hash(results)
    points = field.points_for(results)
    parts.each_with_index.to_h do |part, index|
      [part.discipline, { 'result' => results[index]&.round(1), 'points' => points[index]&.round(1) }]
    end
  end

  def standings_excerpt
    own_rank = own_standing&.rank
    field.standings.select do |standing|
      standing.rank <= TOP_STANDINGS || (own_rank && (standing.rank - own_rank).abs <= NEIGHBOURS)
    end
  end

  def standing_row(standing)
    jump = tracks_by_id[standing.track_id]
    {
      'rank' => standing.rank,
      'name' => profiles_by_id[standing.profile_id]&.name,
      'suit' => jump&.suit&.name,
      'place' => jump&.place&.name,
      'total' => standing.total.round(1),
      'results' => rounded_results(standing.results),
      'self' => standing.profile_id == track.profile_id
    }
  end

  def rounded_results(results)
    parts.each_with_index.to_h { |part, index| [part.discipline, results[index]&.round(1)] }
  end

  def profiles_by_id
    @profiles_by_id ||= Profile.where(id: field.standings.map(&:profile_id) + [track.profile_id]).index_by(&:id)
  end

  def tracks_by_id
    @tracks_by_id ||= Track.where(id: (standings_excerpt + reference_standings.map(&:last)).map(&:track_id))
                           .includes(:suit, :place).index_by(&:id)
  end

  def thresholds
    current = field.total_for(jump_results)
    field.standings
         .select { |standing| standing.total > current && standing.profile_id != track.profile_id }
         .last(MAX_THRESHOLDS)
         .reverse
         .map { |standing| threshold_row(standing, standing.total - current) }
  end

  def threshold_row(standing, gap)
    {
      'rank' => standing.rank,
      'name' => profiles_by_id[standing.profile_id]&.name,
      'total' => standing.total.round(1),
      'extra_needed' => parts.each_with_index.to_h { |part, index| [part.discipline, units_for(index, gap)] }
    }
  end

  def units_for(index, points)
    best = field.bests[index].to_f
    best.positive? ? (points * best / 100).round(1) : nil
  end

  def references
    reference_standings.map { |role, standing| reference_row(role, standing) }
  end

  def reference_row(role, standing)
    jump = tracks_by_id[standing.track_id]
    {
      'role' => role,
      'track_id' => standing.track_id,
      'name' => profiles_by_id[standing.profile_id]&.name,
      'rank' => standing.rank,
      'suit' => jump.suit&.name,
      'place' => jump.place&.name,
      'date' => jump.recorded_at.to_date.iso8601,
      'results' => results_hash(standing.results),
      'total' => standing.total.round(1),
      'metrics' => metrics_for(jump).to_h
    }
  end

  def part_ranks
    parts.each_with_index.to_h do |part, index|
      [part.discipline, field.part_rank(index, track.profile_id, jump_results[index])]
    end
  end

  def reference_standings
    @reference_standings ||= (place_references + part_references)
                             .select(&:last).uniq { |_, standing| standing.track_id }.first(MAX_REFERENCES)
  end

  def place_references
    [['next_above', ranked_above.last], ['same_exit', same_exit_standing], ['leader', ranked_above.first]]
      .select(&:last).uniq { |_, standing| standing.profile_id }
  end

  def part_references
    parts.each_with_index.flat_map do |part, index|
      own = field.pilot_jumps(track.profile_id).min_by { |jump| part_order(part, jump.results[index]) }
      best = field.part_leaders(index).find { |jump| jump.profile_id != track.profile_id }
      [["best_#{part.discipline}", beating(index, best)], ["own_best_#{part.discipline}", beating(index, own)]]
    end
  end

  def part_order(part, value)
    return Float::INFINITY if value.nil?

    part.ascending? ? value : -value
  end

  def beating(index, jump)
    return if jump.nil? || jump.track_id == track.id
    return unless better_at?(index, jump.results[index])

    Track::Debrief::Field::Standing.new(rank: standing_rank(jump.profile_id), profile_id: jump.profile_id,
                                        track_id: jump.track_id, total: field.total_for(jump.results),
                                        results: jump.results)
  end

  def better_at?(index, value)
    jump_results[index].nil? || part_order(parts[index], value) < part_order(parts[index], jump_results[index])
  end

  def standing_rank(profile_id) = field.standings.find { |standing| standing.profile_id == profile_id }&.rank

  def ranked_above
    @ranked_above ||= field.standings.select do |standing|
      standing.profile_id != track.profile_id && (own_standing.nil? || standing.rank < own_standing.rank)
    end
  end

  def same_exit_standing
    return unless track.place_id

    ranked_above.reverse.find { |standing| Track.exists?(id: standing.track_id, place_id: track.place_id) }
  end

  def pilot_jumps
    jumps = field.pilot_jumps(track.profile_id)
    places = Track.where(id: jumps.map(&:track_id)).includes(:place).index_by(&:id)
    jumps.map { |jump| pilot_jump_row(jump, places[jump.track_id]) }
         .sort_by { |row| -row['total'] }
         .first(MAX_PILOT_JUMPS)
  end

  def pilot_jump_row(jump, track_record)
    { 'track_id' => jump.track_id, 'date' => jump.recorded_at.to_date.iso8601, 'place' => track_record&.place&.name,
      'results' => results_hash(jump.results), 'total' => field.total_for(jump.results).round(1) }
  end

  def metrics_for(jump)
    spec = Track::FlightMetrics.window_spec_for(discipline.window_part, finish_line: discipline.finish_line)
    Track::FlightMetrics.new(jump, window_spec: spec, flare: discipline.flare_part.present?)
  end
end
