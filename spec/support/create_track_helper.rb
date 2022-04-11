module CreateTrackHelper
  def create_track_from_file(filename, **args)
    pilot = args.delete(:pilot) || Profile.create!(name: 'Creet T. Heler')
    suit = args.delete(:suit) || Suit.create!(name: 'CTH Suit', manufacturer: manufacturers(:tony))

    track_file = Track::File.create!(file: File.open(file_fixture("tracks/#{filename}")))

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      owner: pilot.owner,
      suit: suit
    }
    CreateTrackService.call(params).tap { |track| track.update!(args) }
  end
end
