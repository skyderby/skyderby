class TrackFile < ActiveRecord::Base
  attr_accessor :file

  has_one :track

  has_attached_file :file

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
