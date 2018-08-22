module SegmentParser
  class GPX
    class Segment
      def initialize(node)
        @node = node
      end

      def name
        @name ||= node.xpath('./name/text()').to_s
      end

      def points_count
        points.count
      end

      def h_up
        changes_in_alitude.inject(0) do |memo, change|
          memo + (change.negative? ? change.abs : 0)
        end
      end

      def h_down
        changes_in_alitude.inject(0) do |memo, change|
          memo + (change.positive? ? change.abs : 0)
        end
      end

      private

      attr_reader :node

      def points
        @points ||= node.xpath('./trkseg/trkpt')
                        .map { |point| point.xpath('./ele/text()').to_s.to_i }
      end

      def changes_in_alitude
        @changes_in_alituted ||= points.each_cons(2).map { |previous, current| previous - current }
      end
    end
  end
end
