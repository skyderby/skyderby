require 'test_helper'

class Api::V1::ManufacturersControllerTest < ActionDispatch::IntegrationTest
  test '#show returns manufacturer with suits' do
    get api_v1_manufacturer_url(manufacturers(:tony))

    assert_response :success
    body = response.parsed_body
    assert_equal 'Tony Suits', body['name']
    assert_equal 'TS', body['code']
    assert_equal ['Apache Series', 'Nala'], body['suits'].pluck('name')
  end
end
