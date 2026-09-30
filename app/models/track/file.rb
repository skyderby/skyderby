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

  attr_accessor :track_attributes

  has_one_attached :file
  has_one_attached :sensor_file

  has_one :track,
          foreign_key: :track_file_id,
          dependent: :restrict_with_error,
          inverse_of: :track_file

  validates :file, presence: true
  validates_attachment :file, max_size: 3.megabytes, extensions: EXTENSIONS
  validates_attachment :sensor_file, max_size: 50.megabytes, extensions: %w[csv]
  validate :validate_files_selection
  validate :validate_sensor_file_pairing

  delegate :empty?, to: :segments, prefix: true

  def source = @source ||= Source.new(self)

  def files=(uploads)
    sensors, tracks = Array(uploads).compact_blank.partition { |upload| SensorParser::Flysight2.sensor_file?(upload) }
    @selected_files_count = { track: tracks.size, sensor: sensors.size }
    self.file = tracks.first if tracks.any?
    self.sensor_file = sensors.first if sensors.any?
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

  def validate_files_selection
    return unless @selected_files_count

    errors.add(:file, :multiple_tracks) if @selected_files_count[:track] > 1
    errors.add(:sensor_file, :multiple_sensors) if @selected_files_count[:sensor] > 1
  end

  def validate_sensor_file_pairing
    sensor_io = pending_attachment_io(:sensor_file)
    return unless file.attached? && sensor_io

    if file_format != 'flysight2'
      errors.add(:sensor_file, :requires_flysight2)
    elsif SensorParser::Flysight2.session_id(sensor_io) != SensorParser::Flysight2.session_id(source.open)
      errors.add(:sensor_file, :session_mismatch)
    end
  end
end
