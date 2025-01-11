require 'test_helper'
require 'minitest/mock'

class TrackRangeTest < ActiveSupport::TestCase
  test 'returns max altitude as from' do
    create_track do |track|
      range = TrackRange.new(track)
      assert_equal 3100, range.from
    end
  end

  test 'returns from argument' do
    create_track do |track|
      range = TrackRange.new(track, from: 3000)
      assert_equal 3000, range.from
    end
  end

  test 'returns max altitude if from argument higher than bounds' do
    create_track do |track|
      range = TrackRange.new(track, from: 3200)
      assert_equal 3100, range.from
    end
  end

  test 'returns to argument' do
    create_track do |track|
      range = TrackRange.new(track, to: 2200)
      assert_equal 2200, range.to
    end
  end

  test 'returns min altitude if to argument lower than bounds' do
    create_track do |track|
      range = TrackRange.new(track, to: 1100)
      assert_equal 1750, range.to
    end
  end

  test 'returns min altitude if to argument higher than from argument' do
    create_track do |track|
      range = TrackRange.new(track, from: 2500, to: 2600)
      assert_equal 1750, range.to
    end
  end

  test 'works with string arguments' do
    create_track do |track|
      range = TrackRange.new(track, from: '2500', to: '2100')
      assert_equal 2500, range.from
      assert_equal 2100, range.to
    end
  end

  test 'returns bounds if both arguments outside' do
    create_track do |track|
      range = TrackRange.new(track, from: '3500', to: '3100')
      assert_equal 3100, range.from
      assert_equal 1750, range.to
    end
  end

  private

  def create_track(&)
    create(:empty_track).tap do |track|
      track.stub(:altitude_bounds, { max_altitude: 3100, min_altitude: 1750, elevation: 1350 }, track, &)
    end
  end
end
