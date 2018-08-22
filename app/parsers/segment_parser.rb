module SegmentParser
  SEGMENT_PARSER = {
    gpx: SegmentParser::GPX
  }.with_indifferent_access.freeze

  def self.for(format)
    SEGMENT_PARSER[format] || SegmentParser::Default
  end
end
