require 'test_helper'

class Skyderby::TrigonometryTest < ActiveSupport::TestCase
  setup do
    Skyderby::Trigonometry.module_eval do
      module_function :normalize_angle
    end
  end

  test 'normalizes angle > 360' do
    assert_equal(
      1,
      Skyderby::Trigonometry.normalize_angle(361)
    )
  end

  test 'normalizes angle < 0' do
    assert_equal(
      179,
      Skyderby::Trigonometry.normalize_angle(-181)
    )
  end
end
