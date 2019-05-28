# == Schema Information
#
# Table name: track_files
#
#  id                :integer          not null, primary key
#  file_file_name    :string(510)
#  file_content_type :string(510)
#  file_file_size    :integer
#  file_updated_at   :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class TrackFile < ApplicationRecord
  attr_accessor :file, :track_attributes

  has_one :track, dependent: :restrict_with_error

  has_attached_file :file
  validates_attachment_file_name :file, matches: [/csv\Z/i, /gpx\Z/i, /tes\Z/i, /kml\Z/i]

  delegate :empty?, to: :segments, prefix: true

  def track_file_data(index = 0)
    @track_file_data ||= file_processor.read_track_data(index)
  end

  def segments
    @segments ||= SegmentParser.for(file_format).new(path: file_path).segments
  end

  def one_segment?
    segments.size == 1
  end

  def file_path
    Paperclip.io_adapters.for(file).path
  end

  def file_extension
    File.extname(file_file_name).delete('.').downcase
  end

  def file_format
    TrackFormatDetector.new(path: file_path).execute
  end
end
