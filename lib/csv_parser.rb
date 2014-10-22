class CSVParser < TrackParser

  require 'csv'
  require 'track_points'

  def parse(index = 0)
    track_points = TrackPoints.new
    CSV.parse(track_data) do |row|
      track_points.points << parse_row(row)
    end
    track_points.points.compact!
    track_points
  end

  def self.parser track_data

    require 'fly_sight_parser'
    require 'columbus_parser'

    case file_format(track_data)
      when :flysight, :flysight2
        FlySightParser
      when :columbusV900
        Columbus_Parser
      else
        nil
    end

  end

  def self.file_format(rows)

    format = nil

    CSV.parse(rows) do |row|
      format = headers.select{|key,value| value == row}.keys[0]
      break if format.present?
    end
    format
  end

  def self.headers
    {:flysight => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc gpsFix numSV),
     :flysight2 => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc heading cAcc gpsFix numSV),
     :columbusV900 => %w(INDEX TAG DATE TIME LATITUDE\ N/S LONGITUDE\ E/W HEIGHT SPEED HEADING VOX)}.freeze
  end

  protected

  def parse_row(row)
  end

end