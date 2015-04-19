class TrackParser
  attr_reader :track_data, :extension

  def initialize(track_data, extension)
    @track_data = track_data
    @extension = extension
  end
end
