module TrackParser
  # file sample:
  #
  # <?xml version="1.0" encoding="UTF-8"?>
  # <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  #   <ExtendedData>
  #     <Data name="GPSModelName">
  #         <value>Dual XGPS160</value>
  #     </Data>
  #   </ExtendedData>
  #   <Placemark>
  #     <gx:Track>
  #       <altitudeMode>absolute</altitudeMode>
  #       <when>2015-08-26T11:53:36Z</when>
  #        <gx:coord>38.920681 55.086239 0.000000</gx:coord>
  #       <when>2015-08-26T11:53:37Z</when>
  #        <gx:coord>38.920479 55.087719 0.000000</gx:coord>
  #       <when>2015-08-26T11:53:38Z</when>
  #        <gx:coord>38.920422 55.088150 0.000000</gx:coord>
  #       <when>2015-08-26T11:53:39Z</when>
  #        <gx:coord>38.920399 55.088150 0.000000</gx:coord>
  #       <when>2015-08-26T11:53:40Z</when>
  #        <gx:coord>38.920330 55.088860 0.000000</gx:coord>
  #        .........

  class Kml
    def initialize(args = {})
      @file_path = args[:path]
    end

    def parse
      track_points = []

      current_point_time = nil
      elements.each do |elem|
        if elem.name == 'when'
          current_point_time = Time.zone.parse(elem.text)
          next
        end

        if current_point_time && elem.name == 'coord'
          point_params = elem.text.split(' ')
          track_points << PointRecord.new.tap do |p|
            p.latitude = point_params[1].to_f
            p.longitude = point_params[0].to_f
            p.abs_altitude = point_params[2].to_f
            p.gps_time = current_point_time
          end
        end

        current_point_time = nil unless elem.name == 'when'
      end

      track_points
    end

    private

    def elements
      doc = File.open(file_path) { |f| Nokogiri::XML(f) }
      doc.search('//gx:Track/*')
    end

    attr_reader :file_path
  end
end
