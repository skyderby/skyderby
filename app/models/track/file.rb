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

class Track::File < ApplicationRecord
  include TrackUploader::Attachment.new(:file)

  attr_accessor :track_attributes

  has_one :track,
          foreign_key: :track_file_id,
          dependent: :restrict_with_error,
          inverse_of: :track_file

  delegate :empty?, to: :segments, prefix: true

  def track_file_data(index = 0)
    @track_file_data ||= file_processor.read_track_data(index)
  end

  def segments
    @segments ||= SegmentParser.for(file_format).new(file).segments
  end

  def one_segment?
    segments.size == 1
  end

  def file_extension
    File.extname(file.original_filename).delete('.').downcase
  end

  def file_format
    TrackFormatDetector.call(file, file_extension)
  end
end
