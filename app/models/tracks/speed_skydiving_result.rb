class Tracks::SpeedSkydivingResult
  delegate :id, to: :track, prefix: true

  def initialize(track)
    @track = track
  end

  def present? = !best_range.nil?

  def result = best_range && best_range[:speed] * 3.6

  def exit_altitude = best_range && scoring.exit_altitude

  def window_start_time = best_range&.dig(:start_point, :gps_time)

  def window_start_altitude = best_range&.dig(:start_point, :altitude)

  def window_end_time = best_range&.dig(:end_point, :gps_time)

  def window_end_altitude = best_range&.dig(:end_point, :altitude)

  private

  attr_reader :track

  def scoring = @scoring ||= SpeedSkydivingCompetition::ResultScore.new(track)

  def best_range
    return @best_range if defined?(@best_range)

    @best_range = scoring.calculate
  end
end
