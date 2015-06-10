require 'csv'

module Skyderby
  module Parsers
    class ParserSelector
      HEADERS = {
        flysight: %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc gpsFix numSV),
        flysight2: %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc heading cAcc gpsFix numSV),
        columbusV900: %w(INDEX TAG DATE TIME LATITUDE\ N/S LONGITUDE\ E/W HEIGHT SPEED HEADING VOX)
      }.freeze

      def execute(data, extension)
        case extension.downcase
        when '.csv'

          case csv_file_format(data)
          when :flysight, :flysight2
            FlySightParser.new data, extension
          when :columbusV900
            ColumbusParser.new data, extension
          end

        when '.gpx'
          GPXParser.new data, extension
        when '.tes'
          TESParser.new data, extension
        end
      end

      def csv_file_format(rows)
        format = nil

        CSV.parse(rows) do |row|
          format = HEADERS.select { |_, value| value == row }.keys[0]
          break if format.present?
        end
        format
      end
    end
  end
end
