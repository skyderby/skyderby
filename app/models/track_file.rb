# == Schema Information
#
# Table name: track_files
#
#  id                :integer          not null, primary key
#  file_file_name    :string(255)
#  file_content_type :string(255)
#  file_file_size    :integer
#  file_updated_at   :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class TrackFile < ActiveRecord::Base
  attr_accessor :file

  has_one :track

  has_attached_file :file, validate_media_type: false
  validates_attachment_file_name :file, matches: [/csv\Z/, /gpx\Z/, /tes\Z/]

  def track_file_data(index = 0)
    @track_file_data ||= file_processor.read_track_data(index)
  end

  def segments
    @segments_list ||= file_processor.read_segments
  end

  def segments_empty?
    segments.empty?
  end

  def one_segment?
    segments.size == 1
  end

  def file_processor
    Skyderby::Tracks::FileProcessor.new(Paperclip.io_adapters.for(file).path)
  end
end
