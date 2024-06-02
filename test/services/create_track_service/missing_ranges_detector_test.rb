require 'test_helper'

class CreateTrackService::MissingRangesDetectorTest < ActiveSupport::TestCase
  test 'detect missing ranges in data' do
    points = [1, 1.2, 1.4, 1.6, 7, 9, 10, 11, 14, 14.2, 14.4, 14.6].map do |fl_time|
      Point.new(fl_time:)
    end

    result = CreateTrackService::MissingRangesDetector.call(points, 5)
    assert_equal [{ start: 1.6, end: 14 }], result
  end

  test 'returns blank array unless points given' do
    assert_empty CreateTrackService::MissingRangesDetector.call([], 5)
  end
end
