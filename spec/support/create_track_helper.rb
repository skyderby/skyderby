module CreateTrackHelper
  def create_track_from_file(filename, **args)
    pilot = create :pilot
    suit = create :suit

    track_file = TrackFile.create(file: File.new(file_fixture("tracks/#{filename}")))

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      owner: pilot.owner,
      suit: suit
    }
    CreateTrackService.call(params).tap { |track| track.update!(args) }
  end
end
