class GfsGradsFetcher
  class Processor
    include ::Skyderby::Trigonometry

    def initialize(input)
      @input = input
    end

    def execute # rubocop:disable Metrics/AbcSize
      validate_input!

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

    attr_reader :input

    def validate_input!
      unless input[:hgtsfc].is_a?(Numeric)
        raise ArgumentError,
              "Surface height value not a number. Value: #{input[:hgtsfc].inspect}"
      end

      array_values = input.slice(:hgtprs, :ugrdprs, :vgrdprs)
      counts = array_values.map { |key, val| { key => val.count } }.reduce(&:merge)

      return if counts.values.uniq.one?

      raise ArgumentError, "Heights and speeds count are different. Value counts: #{counts}"
    end

    def speed_from_components(u:, v:) # rubocop:disable Naming/MethodParameterName
      Math.sqrt((u**2) + (v**2))
    end

    def direction_from_components(u:, v:) # rubocop:disable Naming/MethodParameterName
      (DEG_PER_RAD * Math.atan2(u, v)) + 180
    end
  end
end
