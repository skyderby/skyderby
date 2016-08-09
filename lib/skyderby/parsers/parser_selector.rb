require 'csv'

module Skyderby
  module Parsers
    class ParserSelector
      HEADERS = {
        flysight: %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc gpsFix numSV),
        flysight2: %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc heading cAcc gpsFix numSV),
        flysight3: %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc gpsFix numSV status),
        columbusV900: %w(INDEX TAG DATE TIME LATITUDE\ N/S LONGITUDE\ E/W HEIGHT SPEED HEADING VOX)
      }.freeze

      def execute(data, extension)
        data = data.encode(data.encoding, universal_newline: true)

        klass = 
          case extension.downcase
          when '.csv'

            case csv_file_format(data)
            when :flysight, :flysight2, :flysight3
              FlySightParser
            when :columbusV900
              ColumbusParser
            else
              CSVParser
            end

          when '.gpx'
            GPXParser
          when '.tes'
            TESParser
          when '.kml'
            KMLParser
          end

        klass.new data, extension
      end

      def csv_file_format(rows)
        format = nil

        CSV.parse(rows, row_sep: :auto) do |row|
          format = HEADERS.select { |_, value| value == row }.keys[0]
          break if format.present?
        end
        format
      end
    end
  end
end
