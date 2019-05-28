class MedianFilter
  def initialize(values, window_size:, keys:)
    @values = values

    @window_size = window_size
    if window_size < 3 || window_size.even?
      raise ArgumentError,
            'Step must be odd and higher than 2'
    end

    @keys = keys.is_a?(Array) ? keys : [keys]
  end

  def execute
    neighbors = (window_size / 2).floor
    temp = ([values.first] * neighbors) + values + ([values.last] * neighbors)

    temp.each_cons(window_size).map do |window|
      keys.each do |key|
        window[neighbors][key] = window.map { |x| x[key] || 0 }.sort[neighbors]
      end
      window[neighbors]
    end
  end

  private

  attr_reader :values, :window_size, :keys
end
