module Tracks
  class RawTrackView < TrackView
    private

    def points
      @points ||= begin
        processed_points = PointsPostprocessor::Default.call(track_points)
        cropped_points(processed_points, @range_from, @range_to)
      end
    end
  end
end
