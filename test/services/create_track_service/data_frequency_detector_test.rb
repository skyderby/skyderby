require 'test_helper'

class CreateTrackService::DataFrequencyDetectorTest < ActiveSupport::TestCase
  test 'calculates most popular frequency' do
    points = [1, 1.2, 1.4, 1.6, 7, 9, 10, 11, 14].map do |fl_time|
      Point.new(fl_time:)
    end

    result = CreateTrackService::DataFrequencyDetector.call(points)
    assert_equal 5, result
  end

  test 'returns 1 unless points given' do
    result = CreateTrackService::DataFrequencyDetector.call([])
    assert_equal 1, result
  end

  test 'returns 1 if only one point given' do
    points = [Point.new(fl_time: 1)]
    result = CreateTrackService::DataFrequencyDetector.call(points)
    assert_equal 1, result
  end
end
