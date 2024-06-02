require 'test_helper'

class Tracks::MissingRangesPresenterTest < ActiveSupport::TestCase
  test 'returns blank array if start time equals end time' do
    ranges = [{ 'start' => 1, 'end' => 2 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 1, 1)

    assert_empty result
  end

  test 'returns blank array if ranges are not intersects with selected range' do
    ranges = [{ 'start' => 1, 'end' => 2 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 3, 4)

    assert_empty result
  end

  test 'returns intersected ranges' do
    ranges = [{ 'start' => 10, 'end' => 20 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 13, 21)

    assert_equal [{ start: 0, end: 7 }], result
  end

  test 'returns correct ranges if range fully inside' do
    ranges = [{ 'start' => 482.59, 'end' => 496.79 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 479.0, 538.0)

    assert_equal [{ start: 3.6, end: 17.8 }], result
  end

  test 'drops ranges with duration less than 1 second' do
    ranges = [
      { 'start' => 1.1, 'end' => 2 },
      { 'start' => 2, 'end' => 5 }
    ]

    result = Tracks::MissingRangesPresenter.call(ranges, 1, 5)
    assert_equal [{ start: 1, end: 4 }], result
  end
end
