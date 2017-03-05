module Tracks
  class RawTrackPresenter < TrackPresenter
    protected

    def preprocess_points(raw_points)
      PointsPostprocessor::Default.new(raw_points).execute
    end
  end
end
