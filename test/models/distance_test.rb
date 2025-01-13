require 'test_helper'

class DistanceTest < ActiveSupport::TestCase
  test 'correctly loads decimals' do
    value = Distance.load(BigDecimal(100))
    assert_equal 100, value
  end

  test 'correctly loads floats' do
    value = Distance.load(100.0)
    assert_equal 100, value
  end

  test 'dumps Fixnums' do
    assert_equal 281, Distance.dump(281)
  end

  test 'dumps BigDecimals' do
    assert_equal 281, Distance.dump(BigDecimal(281))
  end

  test 'dumps self as a BigDecimal' do
    value = Distance.load(BigDecimal(100))
    assert_equal BigDecimal(100), value.dump
  end

  test 'can be initialized with feets' do
    value = Distance.new(1000, :ft)
    assert_in_delta 304.8, value, 0.001
  end

  test 'can be initialized with miles' do
    value = Distance.new(5, :mi)
    assert_in_delta 8046.72, value, 0.001
  end

  test 'initializes without conversion if no unit given' do
    value = Distance.new(100)
    assert_equal 100, value
  end

  test 'can be converted to feets' do
    value = Distance.new(304.8)
    assert_in_delta 1000, value.to_ft, 0.001
  end

  test 'can be converted to miles' do
    value = Distance.new(8046.72)
    assert_in_delta 5, value.to_mi, 0.001
  end
end
