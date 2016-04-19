module Skyderby
  module Parsers
    class GPXParser < TrackParser
      attr_accessor :track_points

      Segment = Struct.new(:name, :points_count, :h_up, :h_down)

      def parse(index = 0)
        @index = index
        @index = @index.to_i unless @index.is_a?(Integer)
        @current_track = 0

        @track_points = []
        parse_gpx @track_data

        FileData.new(@track_points, :gpx)
      end

      def read_segments
        @segments = []

        doc = Nokogiri::XML(@track_data)
        doc.root.elements.each do |node|
          # <trk> means segment
          next unless node.node_name.eql? 'trk'

          @segments << read_segment_data(node).to_h
        end

        @segments
      end

      private

      def read_segment_data(node)
        segment = Segment.new('', 0, 0, 0)

        node.elements.each do |node_attr|
          if node_attr.node_name.eql? 'trkseg'
            node_attr.elements.each_cons(2) do |prev_point, trpoint|
              segment.points_count += 1
              segment.h_up += get_alti_diff_up(prev_point, trpoint)
              segment.h_down += get_alti_diff_down(prev_point, trpoint)
            end # trpoint loop
          elsif node_attr.node_name.eql? 'name'
            segment.name = node_attr.text
          end
        end # track attr loop

        segment
      end

      def get_alti_diff_up(prev_point, cur_point)
        alti_diff = get_alti_diff(prev_point, cur_point)
        # if previous point was lower than current
        alti_diff < 0 ? -alti_diff : 0
      end

      def get_alti_diff_down(prev_point, cur_point)
        alti_diff = get_alti_diff(prev_point, cur_point)
        # if previous point was higher than current
        alti_diff > 0 ? alti_diff : 0
      end

      def get_alti_diff(prev_point, cur_point)
        get_point_elev(prev_point) - get_point_elev(cur_point)
      end

      def get_point_elev(point)
        expr = './/*[local-name(.)="ele"]/text()'
        point.xpath(expr).to_s.to_i
      end

      def parse_gpx(track_data)
        doc = Nokogiri::XML(track_data)
        doc.root.elements.each do |node|
          parse_tracks(node)
        end
      end

      def parse_tracks(node)
        return unless node.node_name.eql? 'trk'

        if @index == @current_track
          node.elements.each do |trkseg|
            parse_tracksegments(trkseg)
          end
        end
        @current_track += 1
      end

      def parse_tracksegments(node)
        return unless node.node_name.eql? 'trkseg'

        node.elements.each do |trkpt|
          parse_point trkpt
        end
      end

      def parse_point(node)
        return unless node.node_name.eql? 'trkpt'

        point = Skyderby::Tracks::TrackPoint.new(
          latitude: node.attr('lat').to_f,
          longitude: node.attr('lon').to_f
        )

        node.elements.each do |point_attr|
          case point_attr.name
          when 'ele'
            point.abs_altitude = point_attr.text.to_f
          when 'time'
            point.gps_time = Time.zone.parse(point_attr.text)
          end
        end
        @track_points << point if point_valid point
      end

      def point_valid(point)
        point.abs_altitude && point.gps_time && point.latitude && point.longitude
      end
    end
  end
end
