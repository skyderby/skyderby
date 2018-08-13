module SegmentParser
  class GPX
    def initialize(path:)
      @file_path = path
    end

    def segments
      @segments ||= xml_document.xpath('/gpx/trk').map { |node| segment_summary(node) }
    end

    private

    attr_reader :file_path

    def xml_document
      @xml_document ||=
        File.open(file_path) { |f| Nokogiri::XML(f) }.tap(&:remove_namespaces!)
    end

    def segment_summary(node)
      Segment.new.tap do |segment|
        segment.name = node.xpath('./name/text()').to_s

        summary = segment_info(node.xpath('./trkseg/trkpt'))
        segment.points_count = summary[:points_count]
        segment.h_up = summary[:h_up]
        segment.h_down = summary[:h_down]
      end
    end

    def segment_info(segment_points)
      info = {
        points_count: segment_points.count,
        h_up: 0,
        h_down: 0
      }

      segment_points
        .map { |point| point.xpath('./ele/text()').to_s.to_i }
        .each_cons(2) do |prev_altitude, cur_altitude|
          height_diff = prev_altitude - cur_altitude

          info[:h_up]   += height_diff.negative? ? -height_diff : 0
          info[:h_down] += height_diff.positive? ?  height_diff : 0
        end

      info
    end
  end
end
