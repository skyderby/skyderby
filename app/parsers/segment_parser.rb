module SegmentParser
  SEGMENT_PARSER = {
    gpx: SegmentParser::Gpx
  }.with_indifferent_access.freeze

  def self.for(format)
    SEGMENT_PARSER[format] || SegmentParser::Default
  end
end
