class MedianFilter
  attr_accessor :step

  def initialize(step, keys)

    raise ArgumentError.new('Step must be odd and higher than 3') if step < 3 && step % 2 != 1
    raise ArgumentError.new('Keys must be array of symbols') unless keys.kind_of?(Array) && keys.count > 0

    @step = step
    @keys = keys

  end

  def filter(param_values)
    process_values param_values.clone
  end

  def filter!(param_values)
    process_values param_values
  end

  private

  def process_values(values)

    half_step = (@step - 1) / 2

    values.each_index do |i|

      item = values[i]

      median_points = [ values[ [0, i - half_step].max ],
                        item,
                        values[ [values.count - 1, i + half_step].min ] ]

      @keys.each do |key|
        item[key] = median_points.map { |x| x[key] || 0 }.sort[half_step]
      end

    end
    
    values

  end

end