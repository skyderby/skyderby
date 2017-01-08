class GfsGradsFetcher
  class Parser
    def initialize(input)
      @input = input
    end

    def execute
      output = {}
      input.each do |key, value|
        output[key] = parse_parameter value
      end
      output
    end

    private

    def parse_parameter(str)
      values = str.scan(/(\[\d+\]){2,3}, (.+)/).map { |x| x.last.to_f }
      values.one? ? values.first : values
    end

    attr_reader :input
  end
end
