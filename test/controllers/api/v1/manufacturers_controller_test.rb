require 'test_helper'

class Api::V1::ManufacturersControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns correct fields' do
    get api_v1_manufacturers_url

    assert_response :success
    fields = response.parsed_body['items'].map(&:keys).flatten.uniq
    assert_equal %w[active code id name], fields.sort
  end

  test '#index - filters by ids' do
    tony = manufacturers(:tony)
    rd = manufacturers(:rd)

    3.times { |idx| Manufacturer.create!(name: 'test', code: idx) }

    get api_v1_manufacturers_url(ids: [tony.id, rd.id])

    assert_response :success
    codes = response.parsed_body.fetch('items').map { |el| el['code'] }
    assert_equal [tony.code, rd.code].sort, codes.sort
  end

  test '#show' do
    manufacturer = manufacturers(:tony)

    get api_v1_manufacturer_url(manufacturer)

    assert_response :success
    assert_equal(
      {
        id: manufacturer.id,
        active: false,
        name: manufacturer.name,
        code: manufacturer.code
      }.stringify_keys,
      response.parsed_body
    )
  end

  test '#create - without permissions' do
    assert_no_changes -> { Manufacturer.count } do
      post api_v1_manufacturers_url, params: { manufacturer: { name: 'New maker', code: 'NM' } }
    end

    assert_response :forbidden
  end

  test '#create - with permissions' do
    sign_in users(:admin)

    post api_v1_manufacturers_url, params: { manufacturer: { name: 'New maker', code: 'NM' } }

    assert_response :success
    assert_equal 'New maker', response.parsed_body['name']
    assert_equal 'NM', response.parsed_body['code']
  end

  test '#create - with invalid param' do
    sign_in users(:admin)

    assert_no_changes -> { Manufacturer.count } do
      post api_v1_manufacturers_url, params: { manufacturer: { code: 'NM' } }
    end

    assert_response :unprocessable_entity
    assert_equal({ 'errors' => { 'name' => ["can't be blank"] } }, response.parsed_body)
  end

  test '#update - without permissions' do
    manufacturer = manufacturers(:tony)

    assert_no_changes -> { manufacturer.reload.name } do
      put api_v1_manufacturer_url(manufacturer), params: { manufacturer: { name: 'New maker' } }
    end

    assert_response :forbidden
  end

  test '#update - with permissions' do
    sign_in users(:admin)

    manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')

    assert_changes -> { manufacturer.reload.name }, from: 'Wrong', to: 'New maker' do
      put api_v1_manufacturer_url(manufacturer), params: { manufacturer: { name: 'New maker' } }
    end

    assert_response :success
    assert_equal 'New maker', response.parsed_body['name']
    assert_equal 'WR', response.parsed_body['code']
  end

  test '#update - with invalid param' do
    sign_in users(:admin)

    manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')

    put api_v1_manufacturer_url(manufacturer), params: { manufacturer: { name: '' } }

    assert_response :unprocessable_entity
    assert_equal({ 'errors' => { 'name' => ["can't be blank"] } }, response.parsed_body)
  end

  test '#destroy - without permissions' do
    manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')

    delete api_v1_manufacturer_url(manufacturer)

    assert_response :forbidden
  end

  test '#destroy - with permissions' do
    sign_in users(:admin)

    manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')

    assert_difference -> { Manufacturer.count } => -1 do
      delete api_v1_manufacturer_url(manufacturer)
    end

    assert_response :success
  end

  test '#destroy - when have suits' do
    sign_in users(:admin)

    manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')
    Suit.create!(name: 'Test', manufacturer: manufacturer, kind: :wingsuit)

    assert_no_changes -> { Manufacturer.count } do
      delete api_v1_manufacturer_url(manufacturer)
    end

    assert_response :unprocessable_entity
    assert_equal(
      { 'errors' => { 'base' => ['Cannot delete record because dependent suits exist'] } },
      response.parsed_body
    )
  end
end
