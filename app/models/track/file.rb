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

  self.ignored_columns += %w[file_data]

  EXTENSIONS = %w[csv gpx tes kml].freeze

  attr_accessor :track_attributes

  has_one_attached :file

  has_one :track,
          foreign_key: :track_file_id,
          dependent: :restrict_with_error,
          inverse_of: :track_file

  validates :file, presence: true
  validates_attachment :file, max_size: 3.megabytes, extensions: EXTENSIONS

  delegate :empty?, to: :segments, prefix: true

  def source = @source ||= Source.new(self)

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
end
