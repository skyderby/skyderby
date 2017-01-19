class GfsGradsFetcher
  class Processor
    include ::Skyderby::Trigonometry

    def initialize(input)
      @input = input
    end

    def execute
      hgtsfc = input[:hgtsfc]
      records = input[:hgtprs].map.with_index do |value, index|
        {
          altitude: value - hgtsfc,
          wind_speed: speed_from_components(u: input[:ugrdprs][index], v: input[:vgrdprs][index]),
          wind_direction: direction_from_components(u: input[:ugrdprs][index], v: input[:vgrdprs][index])
        }
      end
      records.reject { |record| record[:altitude].negative? }
    end

    private

    def speed_from_components(u:, v:)
      Math.sqrt(u**2 + v**2)
    end

    def direction_from_components(u:, v:)
      DEG_PER_RAD * Math.atan2(u, v) + 180
    end

    attr_reader :input
  end
end
