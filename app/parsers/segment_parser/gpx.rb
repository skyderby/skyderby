module SegmentParser
  class GPX
    def initialize(path:)
      @file_path = path
    end

    def segments
      @segments ||= xml_document.xpath('/gpx/trk').map { |node| Segment.new(node) }
    end

    private

    attr_reader :file_path

    def xml_document
      @xml_document ||=
        File.open(file_path) { |f| Nokogiri::XML(f) }.tap(&:remove_namespaces!)
    end
  end
end
