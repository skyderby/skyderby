require 'test_helper'

class Sync::CursorTest < ActiveSupport::TestCase
  test 'round-trips position with microsecond precision' do
    time = Time.utc(2026, 9, 28, 10, 11, 12, 345_678)
    cursor = Sync::Cursor.decode(Sync::Cursor.new(time:, id: 42).encode)

    assert_equal time, cursor.time
    assert_equal 42, cursor.id
  end

  test 'decode returns nil for blank token' do
    assert_nil Sync::Cursor.decode(nil)
    assert_nil Sync::Cursor.decode('')
  end

  test 'decode raises Invalid for malformed tokens' do
    ['zzz', Base64.urlsafe_encode64('{"t":1}'), Base64.urlsafe_encode64('[]')].each do |token|
      assert_raises(Sync::Cursor::Invalid) { Sync::Cursor.decode(token) }
    end
  end

  test 'expires by issue time rather than position' do
    old_position = Sync::Cursor.new(time: 10.years.ago, id: 1)
    stale = Sync::Cursor.new(time: 1.day.ago, id: 1, issued_at: (Sync::TOMBSTONE_RETENTION + 1.day).ago)

    assert_not old_position.expired?
    assert_predicate stale, :expired?
  end

  test 'compares by time then id' do
    time = 1.hour.ago

    assert_operator Sync::Cursor.new(time:, id: 1), :<, Sync::Cursor.new(time:, id: 2)
    assert_operator Sync::Cursor.new(time: time - 1, id: 9), :<, Sync::Cursor.new(time:, id: 1)
  end
end
