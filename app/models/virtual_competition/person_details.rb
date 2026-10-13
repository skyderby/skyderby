class VirtualCompetition::PersonDetails
  TRACK_ASSOCIATIONS = [{ suit: :manufacturer }, { place: :country }, :video].freeze

  def initialize(virtual_competition_id:, profile_id:, year: nil, period: nil)
    @virtual_competition_id = virtual_competition_id
    @profile_id = profile_id
    @year = year.presence
    @period_slug = period.presence
  end

  def top_results
    @top_results ||= competition.multi_discipline? ? multi_discipline_jumps : top_single_discipline_results
  end

  def counted_score
    return unless competition.multi_discipline?

    @counted_score ||= standings.counted_score(profile_id.to_i, period:)
  end

  def best?(record) = counted_score ? record.track_id == counted_score.track_id : record == top_results.first

  def chart_points
    top_results
      .sort_by { |record| record.track.recorded_at }
      .map { |record| [record.track.recorded_at, record.result] }
  end

  def chart_data = chart_points.to_json.html_safe # rubocop:disable Rails/OutputSafety

  def competition = @competition ||= VirtualCompetition.find(virtual_competition_id)

  def profile = @profile ||= Profile.find(profile_id)

  private

  attr_reader :virtual_competition_id, :profile_id

  def standings = @standings ||= competition.multi_discipline_standings

  def period
    interval = @period_slug && competition.intervals.find_by(slug: @period_slug)
    VirtualCompetition::MultiDisciplineStandings.period_for(year: @year, interval:)
  end

  def multi_discipline_jumps = standings.jumps_of(profile_id.to_i, period:)

  def top_single_discipline_results
    competition
      .results
      .wind_cancellation(false)
      .joins(:track)
      .where(tracks: { profile_id: profile_id })
      .includes(track: TRACK_ASSOCIATIONS)
      .order(results_order)
      .limit(results_count)
      .to_a
  end

  def results_count = 10

  def results_order
    direction = competition.results_sort_order == 'descending' ? 'DESC' : 'ASC'
    "result #{direction}"
  end
end
