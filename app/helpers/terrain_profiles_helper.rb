module TerrainProfilesHelper
  def terrain_profile_track_label(track)
    return nil if track.blank?

    [
      "##{track.id}",
      track.pilot&.name,
      track.recorded_at && l(track.recorded_at.to_date, format: :short)
    ].compact.join(' · ')
  end
end
