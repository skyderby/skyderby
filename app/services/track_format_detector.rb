require 'csv'

class TrackFormatDetector
  class UnknownFormat < StandardError; end

  FILE_SPECIFIC_DETECTOR = {
    tes: -> (path) { 'wintec' },
    kml: -> (path) { 'kml' },
    gpx: -> (path) { 'gpx' },
    csv: -> (path) { determine_csv_format(path) }
  }.with_indifferent_access.freeze

  CSV_HEADERS = {
    'flysight' => %w(time lat lon hMSL velN velE velD hAcc vAcc sAcc),
    'columbus' => %w(INDEX TAG DATE TIME LATITUDE\ N/S LONGITUDE\ E/W HEIGHT SPEED HEADING VOX)
  }.freeze

  def initialize(path:)
    @path = path
  end

  def execute
    extension = File.extname(path).delete('.').downcase
    FILE_SPECIFIC_DETECTOR[extension]&.call(path) || raise(UnknownFormat)
  end

  private

  attr_reader :path

  def self.determine_csv_format(path)
    first_row = File.open(path, 'r') { |f| CSV.new(f).shift }

    CSV_HEADERS.select { |_, val| (val - first_row).empty? }.keys[0] ||
      ('cyber_eye' if /^\d{4}-\d{2}-\d{2}T/ === first_row[0])
  end
end
