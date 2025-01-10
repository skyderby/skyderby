require 'test_helper'

TestPoint = Struct.new(:latitude, :longitude)

class Skyderby::GeospatialTest < ActiveSupport::TestCase
  test 'calculates distance between points defined as arrays' do
    assert_in_delta(
      93_148.90004154356,
      Skyderby::Geospatial.distance([40.7486, -73.9864], [40.0238, -73.434954]),
      0.0001
    )
  end

  test 'calculates distance between points defined as objects with lat, lon attrs' do
    assert_in_delta(
      93_148.90004154356,
      Skyderby::Geospatial.distance_between_points(
        TestPoint.new(40.7486, -73.9864),
        TestPoint.new(40.0238, -73.434954)
      ),
      0.0001
    )
  end

  test 'converts coordinates to mercator' do
    assert_equal(
      { x: 5_299_203.2243, y: 1_085_722.2185 },
      Skyderby::Geospatial.coordinates_to_mercator(9.770602, 47.6035525)
    )
  end

  test 'converts mercator to coordinates' do
    assert_equal(
      { latitude: 9.771652, longitude: 47.6055389999 },
      Skyderby::Geospatial.mercator_to_coordinates(5_299_424.36041, 1_085_840.05328)
    )
  end

  test 'shitfts position on distance and bearing' do
    assert_equal(
      { latitude: 53.1882739267, longitude: 0.1332773495 },
      Skyderby::Geospatial.shift_position(53.32056, -1.729722, 124_800, 96.02167)
    )
  end
end
