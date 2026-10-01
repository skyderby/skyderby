# == Schema Information
#
# Table name: track_files
#
#  id                :integer          not null, primary key
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class Track::File < ApplicationRecord
  include HasAttachments

  EXTENSIONS = %w[csv gpx tes kml].freeze
  MAX_SENSOR_FILE_SIZE = 50.megabytes

  attr_accessor :track_attributes

  has_one_attached :file
  has_one_attached :sensor_file

  has_one :track,
          foreign_key: :track_file_id,
          dependent: :restrict_with_error,
          inverse_of: :track_file

  validates :file, presence: true
  validates_attachment :file, max_size: 3.megabytes, extensions: EXTENSIONS
  validates_attachment :sensor_file, extensions: %w[gz]
  validate :validate_files_selection
  validate :validate_sensor_file_pairing

  delegate :empty?, to: :segments, prefix: true

  def source = @source ||= Source.new(self)

  def files=(uploads)
    sensors, tracks = Array(uploads).compact_blank.partition { |upload| SensorParser::Flysight2.sensor_file?(upload) }
    @selected_files_count = { track: tracks.size, sensor: sensors.size }
    self.file = tracks.first if tracks.any?
    self.sensor_upload = sensors.first if sensors.any?
  end

  def segments
    @segments ||= SegmentParser.for(file_format).new(source).segments
  end

  def one_segment?
    segments.size == 1
  end

  def file_extension
    file.filename.extension.to_s.downcase
  end

  def file_format
    TrackFormatDetector.call(source, file_extension)
  end

  private

  def sensor_upload=(upload)
    @sensor_file_too_large = upload.size > MAX_SENSOR_FILE_SIZE
    return if @sensor_file_too_large

    content = upload.read
    @sensor_session_id = SensorParser::Flysight2.session_id(StringIO.new(content))
    self.sensor_file = {
      io: StringIO.new(Zlib.gzip(content)),
      filename: "#{upload.try(:original_filename) || ::File.basename(upload.path)}.gz",
      content_type: 'application/gzip'
    }
  end

  def validate_files_selection
    return unless @selected_files_count

    errors.add(:file, :multiple_tracks) if @selected_files_count[:track] > 1
    errors.add(:sensor_file, :multiple_sensors) if @selected_files_count[:sensor] > 1
    return unless @sensor_file_too_large

    errors.add(:sensor_file, :file_too_large, size: ActiveSupport::NumberHelper.number_to_human_size(MAX_SENSOR_FILE_SIZE))
  end

  def validate_sensor_file_pairing
    return unless file.attached? && defined?(@sensor_session_id)

    if file_format != 'flysight2'
      errors.add(:sensor_file, :requires_flysight2)
    elsif @sensor_session_id != SensorParser::Flysight2.session_id(source.open)
      errors.add(:sensor_file, :session_mismatch)
    end
  end
end
