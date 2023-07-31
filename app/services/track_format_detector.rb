require 'csv'

class TrackFormatDetector
  class UnknownFormat < StandardError; end

  FILE_SPECIFIC_DETECTOR = {
    tes: ->(_file) { 'wintec' },
    kml: ->(_file) { 'kml' },
    gpx: ->(_file) { 'gpx' },
    csv: ->(file) { determine_csv_format(file) }
  }.with_indifferent_access.freeze

  CSV_HEADERS = {
    'flysight2' => %w[$FLYS 1],
    'flysight' => %w[time lat lon hMSL velN velE velD hAcc vAcc sAcc],
    'columbus' => ['INDEX', 'TAG', 'DATE', 'TIME', 'LATITUDE N/S', 'LONGITUDE E/W', 'HEIGHT', 'SPEED', 'HEADING', 'VOX']
  }.freeze

  def self.call(*args)
    new(*args).call
  end

  def initialize(file, extension)
    @file = file
    @extension = extension
  end

  def call
    FILE_SPECIFIC_DETECTOR[extension]&.call(file) || raise(UnknownFormat)
  end

  class << self
    private

    def determine_csv_format(file)
      first_row = CSV.new(file.open).shift

      CSV_HEADERS.select { |_, val| (val - first_row).empty? }.keys[0] ||
        ('cyber_eye' if first_row[0].match?(/^\d{4}-\d{2}-\d{2}T/))
    end
  end

  private

  attr_reader :file, :extension
end
