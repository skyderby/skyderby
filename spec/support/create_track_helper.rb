module CreateTrackHelper
  def create_track_from_file(filename, **args)
    pilot = create :pilot
    suit = create :suit

    track_file = Track::File.create(
      file: File.new(Rails.root.join('spec', 'support', 'tracks', filename.to_s))
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      owner: pilot.owner,
      suit: suit
    }
    CreateTrackService.call(params).tap { |track| track.update!(args) }
  end
end
