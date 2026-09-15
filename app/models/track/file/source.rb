class Track::File::Source
  def initialize(track_file)
    @track_file = track_file
  end

  def open = StringIO.new(content)

  def original_filename = track_file.file.filename.to_s

  def content
    @content ||= pending_content || track_file.file.download
  end

  private

  attr_reader :track_file

  def pending_content
    io = track_file.pending_attachment_io(:file)
    return unless io

    io.read.tap { io.rewind if io.respond_to?(:rewind) }
  end
end
