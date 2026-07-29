class PerformanceCompetition::Display
  class Faller
    def self.build(result, color)
      points = Trajectory.new(result).points
      return if points.size < 2

      new(competitor: result.competitor, result:, color:, points:)
    end

    attr_reader :color, :points

    def initialize(competitor:, result:, color:, points:)
      @competitor = competitor
      @result = result
      @color = color
      @points = points
    end

    delegate :name, :country_code, :country_name, to: :competitor

    def suit = [competitor.suit&.manufacturer_code, competitor.suit_name].compact.join(' ')

    def photo_url
      competitor.photo_url(:medium) if competitor.photo
    end

    def result = @result.formatted_result

    def result_value = @result.result.to_f

    def round_number = @result.round.number

    def window_start = points.first[:alt]

    def window_end = points.last[:alt]

    def as_json(*)
      {
        name:,
        color:,
        result:,
        resultValue: result_value,
        windowStart: window_start,
        windowEnd: window_end,
        points:
      }
    end

    private

    attr_reader :competitor
  end
end
