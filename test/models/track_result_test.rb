require 'test_helper'

class Track::ResultTest < ActiveSupport::TestCase
  setup do
    @track = tracks(:hellesylt)
  end

  test 'replace NaN in result with 0.0' do
    record = Track::Result.create!(track: @track, result: Float::NAN)

    assert_equal 0, record.result
  end

  test 'replace Infinity in result with 0.0' do
    record = Track::Result.create!(track: @track, result: Float::INFINITY)

    assert_equal 0, record.result
  end

  test 'correctly handles null in result' do
    record = Track::Result.create!(track: @track, result: nil)

    assert_nil record.result
  end

  test 'validates uniqueness by discipline and track' do
    attrs = { track: @track, discipline: :time }
    Track::Result.create!(attrs)

    assert_not_predicate Track::Result.create(attrs), :valid?
  end
end
