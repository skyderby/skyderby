module Tracks
  class RawTrackView < TrackView
    private

    def points
      @points ||= begin
        processed_points = PointsPostprocessor::Default.new(track_points).execute
        cropped_points(track_points, @range_from, @range_to)
      end
    end
  end
end
