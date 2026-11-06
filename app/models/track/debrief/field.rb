class Track::Debrief::Field
  Jump = Data.define(:track_id, :profile_id, :recorded_at, :results)
  Standing = Data.define(:rank, :profile_id, :track_id, :total, :results)

  attr_reader :discipline, :year

  def initialize(discipline, year:)
    @discipline = discipline
    @year = year
  end

  def fingerprint
    count, latest = scope.pick(Arel.sql('COUNT(*)'), Arel.sql('MAX(virtual_competition_results.updated_at)'))
    [discipline.key, year, count, latest&.to_i].join(':')
  end

  def bests
    @bests ||= discipline.parts.each_with_index.map do |part, index|
      values = jumps.values.filter_map { |jump| jump.results[index] }
      part.ascending? ? values.min : values.max
    end
  end

  def points_for(results)
    discipline.parts.each_with_index.map do |part, index|
      result = results[index]
      best = bests[index]
      next if result.nil?
      next 0.0 if result.to_f.zero? || best.to_f.zero?

      part.ascending? ? best / result * 100 : result / best * 100
    end
  end

  def total_for(results) = points_for(results).sum(&:to_f)

  def results_for(track_id) = jumps[track_id]&.results

  def standings
    @standings ||= jumps.values
                        .group_by(&:profile_id)
                        .map { |profile_id, pilot_jumps| best_standing(profile_id, pilot_jumps) }
                        .sort_by { |standing| [-standing.total, standing.track_id] }
                        .each_with_index.map { |standing, index| standing.with(rank: index + 1) }
  end

  def pilot_jumps(profile_id) = jumps.values.select { |jump| jump.profile_id == profile_id }

  def track_ids = jumps.keys

  def part_leaders(index)
    part = discipline.parts[index]
    order = ->(jump) { part.ascending? ? jump.results[index] : -jump.results[index] }
    jumps.values.select { |jump| jump.results[index] }
         .group_by(&:profile_id).values.map { |pilot_jumps| pilot_jumps.min_by(&order) }
         .sort_by(&order)
  end

  def part_rank(index, profile_id, result)
    return if result.nil?

    better = part_leaders(index).count do |jump|
      jump.profile_id != profile_id && better_result?(discipline.parts[index], jump.results[index], result)
    end
    better + 1
  end

  private

  def scope
    VirtualCompetition::Result
      .joins(:track)
      .where(virtual_competition_id: discipline.competitions.map(&:id), wind_cancelled: false)
      .where.not(tracks: { profile_id: nil })
      .where(tracks: { recorded_at: Date.new(year).all_year })
  end

  def jumps
    @jumps ||= scope
               .pluck(:virtual_competition_id, :discipline_id, :track_id, 'tracks.profile_id', 'tracks.recorded_at',
                      :result)
               .each_with_object({}) { |row, jumps| add_result(jumps, row) }
  end

  def add_result(jumps, row)
    competition_id, discipline_id, track_id, profile_id, recorded_at, result = row
    index = discipline.part_index_for(competitions_by_id[competition_id], discipline_id)
    return if index.nil?

    jump = jumps[track_id] ||= Jump.new(track_id:, profile_id:, recorded_at:, results: Array.new(discipline.parts.size))
    current = jump.results[index]
    jump.results[index] = current.nil? ? result : better(discipline.parts[index], current, result)
  end

  def better(part, current, result) = part.ascending? ? [current, result].min : [current, result].max

  def better_result?(part, value, other) = part.ascending? ? value < other : value > other

  def competitions_by_id
    @competitions_by_id ||= begin
      ActiveRecord::Associations::Preloader.new(records: discipline.competitions, associations: :disciplines).call
      discipline.competitions.index_by(&:id)
    end
  end

  def best_standing(profile_id, pilot_jumps)
    best = pilot_jumps.max_by { |jump| [total_for(jump.results), -jump.recorded_at.to_f] }
    Standing.new(rank: nil, profile_id:, track_id: best.track_id, total: total_for(best.results), results: best.results)
  end
end
