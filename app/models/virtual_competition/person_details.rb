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
    return @counted_score if defined?(@counted_score)

    @counted_score = competition.standings(year: @year, interval:).find_by(profile_id:)
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

  def interval
    return @interval if defined?(@interval)

    @interval = @period_slug && competition.intervals.find_by(slug: @period_slug)
  end

  def multi_discipline_jumps
    VirtualCompetition::Standing
      .personal_jumps(competition_ids: [competition.id], period:)
      .where(profile_id:)
      .includes(:suit, track: TRACK_ASSOCIATIONS, virtual_competition: :disciplines)
      .order(sort_value: :desc, recorded_at: :asc, track_id: :asc)
      .to_a
  end

  def period = VirtualCompetition::Standing.period(year: @year, interval:)

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
