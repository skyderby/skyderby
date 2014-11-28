module MovingAverage

  class MovingAvg

    def initialize(window_size, keys)
      raise ArgumentError.new('Keys must be array of symbols') if keys_invalid(keys)

      @window_size = window_size
      @keys = keys
    end

    def process(values)
      neighbors = (@window_size / 2).floor
      temp = ([values.first] * neighbors) + values + ([values.last] * neighbors)

      temp.each_cons(@window_size).map do |window|
        @keys.each do |key|
          window[neighbors][key] = window.map { |x| x[key] }.inject(0, :+) / @window_size
        end
        window[neighbors]
      end
    end

    private

    def keys_invalid(keys)
      return true unless keys.kind_of?(Array) || !keys.empty? || keys.detect{ |x| !x.kind_of? Symbol }.nil?
      false
    end

  end

  def self.process(values, window_size, keys)

    moving_average = MovingAvg.new(window_size, keys)
    moving_average.process values

  end

end