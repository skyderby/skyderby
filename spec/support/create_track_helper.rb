module CreateTrackHelper
  def create_track_from_file(filename)
    pilot = create :pilot
    suit = create :suit

    track_file = TrackFile.create(
      file: File.new(Rails.root.join('spec', 'support', 'tracks', filename.to_s))
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      user: pilot.owner,
      suit: suit
    }
    CreateTrackService.call(params)
  end
end
