module TrackParser
  class Gpx
    def initialize(args = {})
      @file = args[:file]
      @segment = args.fetch(:segment, 0).to_i + 1
    end

    def parse
      doc = Nokogiri::XML(file.open)
      doc.remove_namespaces!

      doc.xpath("/gpx/trk[#{segment}]/trkseg/trkpt").map do |node|
        parse_point(node)
      end
    end

    private

    attr_reader :file, :segment

    def parse_point(node)
      PointRecord.new.tap do |p|
        p.latitude  = node.attr('lat').to_f
        p.longitude = node.attr('lon').to_f
        p.abs_altitude = node.xpath('./ele/text()').to_s.to_f
        p.gps_time = Time.zone.parse(node.xpath('./time/text()').to_s)
      end
    end
  end
end
