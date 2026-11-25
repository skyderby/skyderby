module PointArraysHelper
  def sync_point_arrays(track)
    Track::Points.where(track_id: track.id).delete_all
    Track::Points.copy_from_legacy!([track.id])
    track.reset_point_arrays
  end
end
