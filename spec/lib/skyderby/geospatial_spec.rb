require 'spec_helper'

describe Skyderby::Geospatial do
  it 'calculates distance between points defined as arrays' do
    expect(
      Skyderby::Geospatial.distance([40.7486, -73.9864], [40.0238, -73.434954])
    ).to eq(93_148.90004154356)
  end

  it 'calculates distance between points defined as objects with lat, lon attrs' do
    TestPoint = Struct.new(:latitude, :longitude)

    expect(
      Skyderby::Geospatial.distance_between_points(
        TestPoint.new(40.7486, -73.9864),
        TestPoint.new(40.0238, -73.434954)
      )
    ).to eq(93_148.90004154356)
  end

  it 'converts coordinates to mercator' do
    expect(
      Skyderby::Geospatial.coordinates_to_mercator(9.770602, 47.6035525)
    ).to eq(x: 5_299_203.2243, y: 1_085_722.2185)
  end

  it 'converts mercator to coordinates' do
    expect(
      Skyderby::Geospatial.mercator_to_coordinates(5_299_424.36041, 1_085_840.05328)
    ).to eq(latitude: 9.771652, longitude: 47.6055389999)
  end
end
