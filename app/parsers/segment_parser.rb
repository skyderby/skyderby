module SegmentParser
  Segment = Struct.new(:name, :points_count, :h_up, :h_down)

  SEGMENT_PARSER = {
    gpx: SegmentParser::GPX
  }.with_indifferent_access.freeze

  def self.for(format)
    SEGMENT_PARSER[format] || SegmentParser::Default
  end
end
