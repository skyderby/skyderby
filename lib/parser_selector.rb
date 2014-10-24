require 'csv'

require 'parsers/track_parser'
require 'parsers/csv_parser'
require 'parsers/gpx_parser'
require 'parsers/tes_parser'
require 'parsers/fly_sight_parser'
require 'parsers/columbus_parser'

module ParserSelector

  HEADERS = {
      :flysight => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc gpsFix numSV),
      :flysight2 => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc heading cAcc gpsFix numSV),
      :columbusV900 => %w(INDEX TAG DATE TIME LATITUDE\ N/S LONGITUDE\ E/W HEIGHT SPEED HEADING VOX)
    }.freeze

  def choose(data, extension)

    case extension
      when '.csv'

        case file_format(data)
          when :flysight, :flysight2
            FlySightParser.new data, extension
          when :columbusV900
            Columbus_Parser.new data, extension
          else
            nil
        end

      when '.gpx'
        GPXParser.new data, extension
      when '.tes'
        TESParser.new data, extension
      else
        nil
    end

  end

  def file_format(rows)

    format = nil

    CSV.parse(rows) do |row|
      format = HEADERS.select { |_,value| value == row }.keys[0]
      break if format.present?
    end
    format
  end

end