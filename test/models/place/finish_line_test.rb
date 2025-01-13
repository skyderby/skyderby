require 'test_helper'

class Place::FinishLineTest < ActiveSupport::TestCase
  test '#center' do
    coordinates = {
      start_latitude: '60.0',
      start_longitude: '10.4',
      end_latitude: '66.0',
      end_longitude: '12.6'
    }
    finish_line = Place::FinishLine.new(coordinates)

    assert_in_delta 63, finish_line.center[:latitude], 0.001
    assert_in_delta 11.5, finish_line.center[:longitude], 0.001
  end
end
