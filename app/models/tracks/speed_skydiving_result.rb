class Tracks::SpeedSkydivingResult
  VALIDATION_WINDOW = 1000 # m above the end of the scoring window
  ACCURACY_THRESHOLD = 3

  delegate :id, to: :track, prefix: true

  def initialize(track)
    @track = track
  end

  def scored? = !best_range.nil?

  def accuracy_valid?
    return false unless scored?

    validation_points.none? do |point|
      point[:vertical_accuracy] &&
        Math.sqrt(2) * point[:vertical_accuracy] / 3 >= ACCURACY_THRESHOLD
    end
  end

  def result = best_range && best_range[:speed] * 3.6

  def exit_altitude = best_range && scoring.exit_altitude

  def window_start_time = best_range&.dig(:start_point, :gps_time)

  def window_start_altitude = best_range&.dig(:start_point, :altitude)

  def window_end_time = best_range&.dig(:end_point, :gps_time)

  def window_end_altitude = best_range&.dig(:end_point, :altitude)

  def scoring_window_end_altitude_msl
    return unless best_range

    floor = [
      exit_altitude - SpeedSkydivingCompetition::ResultScore::WINDOW,
      SpeedSkydivingCompetition::ResultScore::BREAKOFF_ALTITUDE
    ].max

    floor + track.msl_offset
  end

  private

  attr_reader :track

  def scoring = @scoring ||= SpeedSkydivingCompetition::ResultScore.new(track)

  def validation_points
    scoring.points.select do |point|
      point[:altitude].between?(window_end_altitude, window_end_altitude + VALIDATION_WINDOW)
    end
  end

  def best_range
    return @best_range if defined?(@best_range)

    @best_range = scoring.calculate
  end
end
