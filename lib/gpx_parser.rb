class GPXParser < TrackParser
  def parse(index = 0)
    @index = index
    @current_track = 0

    parse_track @track_data
    @track_points

    track_points
  end

  private

  def parse_gpx track_data
    doc = Nokogiri::XML(track_data)
    doc.root.elements.each do |node|
      parse_tracks(node)
    end
  end

  def parse_tracks(node)
    if node.node_name.eql? 'trk'
      if @index == @current_track
        node.elements.each do |trkseg|
          parse_tracksegments(trkseg)
        end
      end
      @current_track += 1
    end
  end

  def parse_tracksegments(node)
    if trkseg.node_name.eql? 'trkseg'
      node.elements.each do |trkpt|
        parse_point trkpt
      end
    end
  end

  def parse_point(node)
    if node.node_name.eql? 'trkpt'
      point = { :latitude => trpoint.attr('lat').to_f, :longitude => trpoint.attr('lon').to_f }
      node.elements.each do |node|
        point[:elevation] = node.text.to_f if node.name.eql? 'ele'
        point[:abs_altitude] = node.text.to_f if node.name.eql? 'ele'
        point[:point_created_at] = node.text.to_s if node.name.eql? 'time'
      end
      @track_points << point
    end
  end
end