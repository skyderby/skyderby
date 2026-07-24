require 'test_helper'

class Track::ResultTest < ActiveSupport::TestCase
  setup do
    @track = tracks(:hellesylt)
  end

  test 'replace NaN in result with 0.0' do
    record = Track::Result.create!(track: @track, variant: Track::Result::BEST_VARIANT, result: Float::NAN)

    assert_equal 0, record.result
  end

  test 'replace Infinity in result with 0.0' do
    record = Track::Result.create!(track: @track, variant: Track::Result::BEST_VARIANT, result: Float::INFINITY)

    assert_equal 0, record.result
  end

  test 'correctly handles null in result' do
    record = Track::Result.create!(track: @track, variant: Track::Result::BEST_VARIANT, result: nil)

    assert_nil record.result
  end

  test 'validates uniqueness by discipline, track and variant' do
    attrs = { track: @track, discipline: :time, variant: Track::Result::BEST_VARIANT }
    Track::Result.create!(attrs)

    assert_not_predicate Track::Result.create(attrs), :valid?
  end

  test 'allows the same discipline on the same track under a different variant' do
    Track::Result.create!(track: @track, discipline: :time, variant: Track::Result::BEST_VARIANT)
    other = Track::Result.create(track: @track, discipline: :time, variant: Track::Result::COMPETITION_VARIANT)

    assert_predicate other, :valid?
  end
end
