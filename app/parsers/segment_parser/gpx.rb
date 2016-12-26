module SegmentParser
  class GPX
    def initialize(path:)
      @file_path = path
    end

    def segments
      @segments ||= begin
        doc = File.open(file_path) { |f| Nokogiri::XML(f) }
        doc.remove_namespaces!
        expr = '/gpx/trk'
        doc.xpath(expr).map do |node|
          read_segment_data(node)
        end
      end
    end

    private

    def read_segment_data(node)
      Segment.new('', 0, 0, 0).tap do |s|
        s.name = node.xpath('./name/text()').to_s

        node.xpath('./trkseg/trkpt').each_cons(2) do |prev_point, cur_point|
          s.points_count += 1

          height_diff = get_alti_diff(prev_point, cur_point)
          s.h_up   += height_diff.negative? ? -height_diff : 0
          s.h_down += height_diff.positive? ?  height_diff : 0
        end
      end
    end

    def get_alti_diff(prev_point, cur_point)
      get_point_elev(prev_point) - get_point_elev(cur_point)
    end

    def get_point_elev(point)
      expr = './ele/text()'
      point.xpath(expr).to_s.to_i
    end

    attr_reader :file_path
  end
end
