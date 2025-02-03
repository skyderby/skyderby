require 'test_helper'

class PerformanceCompetition::ReferencePointTest < ActiveSupport::TestCase
  test '.find_or_create - find when only name given' do
    event = events(:nationals)
    created_point = event.reference_points.create!(name: 'R1', latitude: 20, longitude: 20)

    found_point = event.reference_points.find_or_create_by(name: 'R1')

    assert_equal created_point, found_point
  end

  test '.find_or_create - find when name and coordinates given' do
    event = events(:nationals)
    created_point = event.reference_points.create!(name: 'R1', latitude: 20, longitude: 20)

    found_point = event.reference_points.find_or_create_by(name: 'R1', latitude: 20, longitude: 20)

    assert_equal created_point, found_point
  end

  test '.find_or_create - create when coordinates different' do
    event = events(:nationals)
    event.reference_points.create!(name: 'R1', latitude: 20, longitude: 20)

    found_point = event.reference_points.find_or_create_by(name: 'R1', latitude: 30, longitude: 30)

    assert_equal 30, found_point.latitude
    assert_equal 30, found_point.longitude
  end
end
