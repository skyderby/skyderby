class VirtualCompetition::MultiDisciplineStandings
  TRACK_ASSOCIATIONS = [{ suit: :manufacturer }, { place: :country }, :video, { pilot: :owner }].freeze

  Entry = Data.define(:discipline, :result, :best) do
    def gap = result && best ? result - best : nil

    def best? = result.present? && result == best

    def points
      return 0.0 if result.to_f.zero? || best.to_f.zero?

      discipline.results_sort_order == 'ascending' ? best / result * 100 : result / best * 100
    end
  end

  class Score
    attr_accessor :rank
    attr_reader :virtual_competition, :track, :entries

    delegate :suit, :recorded_at, :profile_id, to: :track
    delegate :id, to: :track, prefix: true

    def initialize(virtual_competition, track, entries)
      @virtual_competition = virtual_competition
      @track = track
      @entries = entries
    end

    def profile = track.pilot

    def entry(discipline) = entries.find { |entry| entry.discipline == discipline }

    def result = entries.sum(&:points)
  end

  def initialize(competition)
    @competition = competition
  end

  def overall = scores_for(nil)

  def for_year(year) = scores_for(Date.new(year).all_year)

  def for_interval(interval) = scores_for(interval && (interval.period_from..interval.period_to))

  def tracks_of(profile_id)
    track_scores(results(nil).where(tracks: { profile_id: }).to_a).sort_by { |score| -score.result }
  end

  private

  attr_reader :competition

  def scores_for(period)
    jumps_by_pilot = results(period).to_a.group_by { |record| record.track.profile_id }.values

    track_scores(jumps_by_pilot.flat_map { |records| counted_jump(records) })
      .sort_by { |score| -score.result }
      .each.with_index(1) { |score, rank| score.rank = rank }
  end

  def counted_jump(records)
    best = track_scores(records).max_by(&:result)
    records.select { |record| record.track_id == best.track_id }
  end

  def track_scores(records)
    bests = best_results(records)
    records.group_by(&:track).map { |track, track_records| build_score(track, track_records, bests) }
  end

  def build_score(track, records, bests)
    by_discipline = records.index_by(&:discipline_id)

    entries = competition.disciplines.map do |discipline|
      Entry.new(discipline:, result: by_discipline[discipline.id]&.result, best: bests[discipline.id])
    end

    Score.new(competition, track, entries)
  end

  def best_results(records)
    competition.disciplines.to_h do |discipline|
      values = records.select { |record| record.discipline_id == discipline.id }.map(&:result)
      [discipline.id, discipline.results_sort_order == 'ascending' ? values.min : values.max]
    end
  end

  def results(period)
    scope = competition.results.where.not(discipline_id: nil).wind_cancellation(false)
                       .joins(:track).includes(track: TRACK_ASSOCIATIONS)
    period ? scope.where(tracks: { recorded_at: period }) : scope
  end
end
