require 'test_helper'

class Api::Web::PlacesControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns correct fields' do
    get api_v1_places_url

    fields = response.parsed_body['items'].map(&:keys).flatten.uniq.sort
    assert_equal %w[id name countryId kind latitude longitude msl permissions cover photos].sort, fields
  end

  test '#index - filters by ids' do
    country = countries(:norway)
    hellesylt = places(:hellesylt)
    loen = places(:loen)

    3.times { Place.create!(name: 'test', latitude: 1, longitude: 1, country:) }

    get api_v1_places_url(ids: [hellesylt.id, loen.id])

    assert_response :success
    names = response.parsed_body.fetch('items').pluck('name')
    assert_equal [hellesylt.name, loen.name].sort, names.sort
  end
end
