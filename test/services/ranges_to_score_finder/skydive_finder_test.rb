require 'test_helper'

class RangesToScoreFinder::SkydiveFinderTest < ActiveSupport::TestCase
  test 'returns same range as given bounds if height diff < 1000' do
    altitude_bounds = { max_altitude: 3000, min_altitude: 2700 }
    ranges_finder = RangesToScoreFinder.for(:skydive).new(altitude_bounds)
    ranges_to_score = ranges_finder.calculate

    assert_equal 1, ranges_to_score.size
    assert_equal(
      {
        start_altitude: altitude_bounds[:max_altitude],
        end_altitude: altitude_bounds[:min_altitude]
      },
      ranges_to_score.first
    )
  end

  test 'returns min skydive altitude if min in given bounds is lower' do
    altitude_bounds = { max_altitude: 1500, min_altitude: 500 }
    ranges_finder = RangesToScoreFinder.for(:skydive).new(altitude_bounds)
    ranges_to_score = ranges_finder.calculate

    assert_equal 1, ranges_to_score.size
    assert_equal(
      {
        start_altitude: altitude_bounds[:max_altitude],
        end_altitude: RangesToScoreFinder::SkydiveFinder::MIN_ALTITUDE
      },
      ranges_to_score.first
    )
  end

  test 'splits given range by 1000 m ranges with defined step' do
    altitude_bounds = { max_altitude: 2200, min_altitude: 900 }
    ranges_finder = RangesToScoreFinder.for(:skydive).new(altitude_bounds)
    ranges_to_score = ranges_finder.calculate

    assert_equal 4, ranges_to_score.size
    assert_equal(
      [
        { start_altitude: 2200, end_altitude: 1200 },
        { start_altitude: 2150, end_altitude: 1150 },
        { start_altitude: 2100, end_altitude: 1100 },
        { start_altitude: 2050, end_altitude: 1050 }
      ],
      ranges_to_score
    )
  end

  test 'returns blank array if height diff <=0' do
    altitude_bounds = { max_altitude: 0, min_altitude: 0 }
    ranges_finder = RangesToScoreFinder.for(:skydive).new(altitude_bounds)
    ranges_to_score = ranges_finder.calculate

    assert_empty ranges_to_score
  end
end
