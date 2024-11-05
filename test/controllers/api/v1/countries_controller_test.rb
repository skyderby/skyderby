require 'test_helper'

class Api::Web::CountriesControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns correct fields' do
    get api_v1_countries_url

    fields = response.parsed_body['items'].map(&:keys).flatten.uniq.sort

    assert_equal %w[code id name], fields
  end

  test '#index - filters by ids' do
    norway = countries(:norway)
    russia = countries(:russia)

    3.times { |idx| Country.create!(name: 'test', code: idx) }

    get api_v1_countries_url(ids: [norway.id, russia.id])

    assert_response :success

    names = response.parsed_body.fetch('items').pluck('name').sort
    assert_equal [norway.name, russia.name].sort, names
  end
end
