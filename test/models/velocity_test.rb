require 'test_helper'

class VelocityTest < ActiveSupport::TestCase
  test 'load 100 correctly' do
    value = Velocity.load(100)
    assert_equal 100, value
  end

  test 'load Infinity as 0' do
    value = Velocity.load(Float::INFINITY)
    assert_equal 0, value
  end

  test 'dumps Fixnums' do
    assert_equal 281, Velocity.dump(281)
  end

  test 'dumps BigDecimals' do
    assert_equal 281, Velocity.dump(BigDecimal(281))
  end
end
