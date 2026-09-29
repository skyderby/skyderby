class VirtualCompetition::PersonDetails
  TRACK_ASSOCIATIONS = [{ suit: :manufacturer }, { place: :country }, :video].freeze

  def initialize(virtual_competition_id:, profile_id:)
    @virtual_competition_id = virtual_competition_id
    @profile_id = profile_id
  end

  def top_results
    @top_results ||=
      competition
      .results
      .wind_cancellation(false)
      .joins(:track)
      .where(tracks: { profile_id: profile_id })
      .includes(track: TRACK_ASSOCIATIONS)
      .order(results_order)
      .limit(results_count)
  end

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

  def results_count = 10

  def results_order
    direction = competition.results_sort_order == 'descending' ? 'DESC' : 'ASC'
    "result #{direction}"
  end
end
