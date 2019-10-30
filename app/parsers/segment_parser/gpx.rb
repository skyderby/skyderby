module SegmentParser
  class GPX
    def initialize(file)
      @file = file
    end

    def segments
      @segments ||= xml_document.xpath('/gpx/trk').map { |node| Segment.new(node) }
    end

    private

    attr_reader :file

    def xml_document
      @xml_document ||= Nokogiri::XML(file.open).tap(&:remove_namespaces!)
    end
  end
end
