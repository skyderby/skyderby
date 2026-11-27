module PointArraysHelper
  ParsedPoint = Struct.new(*Track::Points::COLUMNS, keyword_init: true)
  PARSED_DEFAULTS = { distance: 0, h_speed: 0, v_speed: 0 }.freeze

  def record_points(track, rows, jump_range: nil)
    points = rows.map do |row|
      ParsedPoint.new(**PARSED_DEFAULTS, **row, gps_time: Time.zone.at(row.fetch(:gps_time).to_r))
    end
    Track::Points.record(track, points)
    track.update!(ff_start: jump_range.begin, ff_end: jump_range.end) if jump_range
  end

  def build_point(**attributes)
    Track::Points::Point.new(**Track::Points::Point.members.index_with(nil), **attributes)
  end
end
