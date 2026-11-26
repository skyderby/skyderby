module PointArraysHelper
  LegacyPoint = Struct.new(*Track::Points::COLUMNS, keyword_init: true)

  def sync_point_arrays(track)
    Track::Points.where(track_id: track.id).delete_all
    Track::Points.record(track, legacy_points(track))
  end

  def build_point(**attributes)
    Track::Points::Point.new(**Track::Points::Point.members.index_with(nil), **attributes)
  end

  private

  def legacy_points(track)
    track.points.reorder(:gps_time_in_seconds, :id).map do |point|
      LegacyPoint.new(
        **Track::Points::COLUMNS.index_with { |column| point.try(column) },
        gps_time: Time.zone.at(point.gps_time_in_seconds),
        distance: point.distance || 0, h_speed: point.h_speed || 0, v_speed: point.v_speed || 0
      )
    end
  end
end
