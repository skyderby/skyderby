require 'test_helper'

class RangesToScoreFinder::BaseFinderTest < ActiveSupport::TestCase
  test 'returns range as given bounds, start altitude lower on 10 meters' do
    altitude_bounds = { max_altitude: 3000, min_altitude: -30 }
    ranges_finder = RangesToScoreFinder.for(:base).new(altitude_bounds)
    ranges_to_score = ranges_finder.calculate

    assert_equal 1, ranges_to_score.size
    assert_equal(
      {
        start_altitude: altitude_bounds[:max_altitude] - 10,
        end_altitude: altitude_bounds[:min_altitude]
      },
      ranges_to_score.first
    )
  end
end
