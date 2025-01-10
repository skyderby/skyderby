require 'test_helper'

class Api::V1::SuitsControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns correct fields' do
    get api_v1_suits_url

    fields = response.parsed_body['items'].map(&:keys).flatten.uniq.sort

    assert_equal %w[category editable id makeId name], fields
  end

  test '#index - filters by ids' do
    manufacturer = manufacturers(:tony)
    apache = suits(:apache)
    nala = suits(:nala)

    3.times { Suit.create!(name: 'test', manufacturer: manufacturer) }

    get api_v1_suits_url(ids: [apache.id, nala.id])

    assert_response :success

    names = response.parsed_body.fetch('items').pluck('name')
    assert_equal [apache.name, nala.name].sort, names.sort
  end
end
