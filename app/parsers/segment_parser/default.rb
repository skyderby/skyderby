module SegmentParser
  class NullSegment
    attr_reader :name, :points_count, :h_up, :h_down

    def initialize
      @name = 'default'
      @points_count = 0
      @h_up = 0
      @h_down = 0
    end
  end

  class Default
    def initialize(...); end

    def segments
      [NullSegment.new]
    end
  end
end
