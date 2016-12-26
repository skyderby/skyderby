module SegmentParser
  class Default
    def initialize(path:); end

    def segments
      [Segment.new(:default, 0, 0, 0)]
    end
  end
end
