require 'tracks/track_point'

module Skyderby
  module Parsers
    class GPXParser < TrackParser
      attr_accessor :track_points

      def parse(index = 0)
        @index = index
        @current_track = 0

        @track_points = []
        parse_gpx @track_data
        @track_points
      end

      def read_segments
        segments = []

        doc = Nokogiri::XML(@track_data)
        doc.root.elements.each do |node|
          if node.node_name.eql? 'trk'
            track_name = ''
            points_count = 0
            h_up = 0
            h_down = 0
            prev_height = nil

            node.elements.each do |node_attr|
              if node_attr.node_name.eql? 'trkseg'
                node_attr.elements.each do |trpoint|
                  points_count += 1

                  trpoint.elements.each do |point_node|
                    if point_node.name.eql? 'ele'
                      unless prev_height.nil?
                        h_up += (point_node.text.to_f - prev_height) if prev_height < point_node.text.to_f
                        h_down += (prev_height - point_node.text.to_f) if prev_height > point_node.text.to_f
                      end
                      prev_height = point_node.text.to_f
                    end
                  end # point node loop
                end # trpoint loop
              elsif node_attr.node_name.eql? 'name'
                track_name = node_attr.text.to_s
              end
            end # track attr loop

            segments << {
              name: track_name,
              h_up: h_up.to_i.to_s,
              h_down: h_down.to_i.to_s,
              points_count: points_count
            }
          end # if name.eql? 'trk'
        end # doc root loop

        segments
      end

      private

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

        point = TrackPoint.new(latitude: node.attr('lat').to_f,
                               longitude: node.attr('lon').to_f)
        node.elements.each do |point_attr|
          case point_attr.name
          when 'ele'
            point.elevation = point_attr.text.to_f
            point.abs_altitude = point_attr.text.to_f
          when 'time'
            point.gps_time = Time.parse(point_attr.text)
          end
        end
        @track_points << point
      end
    end
  end
end
