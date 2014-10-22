class TrackParser

  attr_reader :track_data, :extension

  require 'csv_parser'
  require 'gpx_parser'
  require 'tes_parser'

  def initialize(track_data, extension)
    @track_data = track_data
    @extension = extension
  end

  def self.parser(data, extension)

    case extension
      when '.csv'
        CSVParser.parser data
      when '.gpx'
        GPXParser
      when '.tes'
        TESParser
      else
        nil
    end
  end

end