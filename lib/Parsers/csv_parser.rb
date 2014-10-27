require 'csv'
require 'track_points'

class CSVParser < TrackParser

  def parse(index = 0)
    track_points = []
    CSV.parse(track_data) do |row|
      track_points << parse_row(row)
    end
    track_points.compact!
  end

  protected

  def parse_row(row)
  end

end