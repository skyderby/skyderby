require 'test_helper'

class Api::V1::SyncControllerTest < ActionDispatch::IntegrationTest
  setup do
    [Country, Manufacturer, Suit, Place, Place::FinishLine].each do |model|
      model.update_all(updated_at: 1.hour.ago)
    end
  end

  test 'full snapshot pages through all records ordered by updated_at and id' do
    ids = []
    cursor = nil

    loop do
      get api_v1_sync_url('places', limit: 3, since: cursor)
      assert_response :success
      body = response.parsed_body
      ids.concat(body['items'].pluck('id'))
      cursor = body['cursor']
      break unless body['hasMore']
    end

    assert_equal Place.order(:updated_at, :id).ids, ids
  end

  test 'incremental sync returns only changed records' do
    get api_v1_sync_url('suits')
    cursor = response.parsed_body['cursor']
    assert_not response.parsed_body['hasMore']

    suits(:nala).update_columns(name: 'Nala 2', updated_at: 10.seconds.ago)
    get api_v1_sync_url('suits', since: cursor)

    body = response.parsed_body
    assert_equal [suits(:nala).id], body['items'].pluck('id')
    assert_equal 'Nala 2', body['items'].first['name']
    assert_empty body['deleted']
  end

  test 'records changed within the commit overlap are served again' do
    suits(:nala).update_columns(updated_at: 1.second.ago)

    get api_v1_sync_url('suits')
    assert_includes response.parsed_body['items'].pluck('id'), suits(:nala).id

    get api_v1_sync_url('suits', since: response.parsed_body['cursor'])
    assert_equal [suits(:nala).id], response.parsed_body['items'].pluck('id')
  end

  test 'returns deleted ids since cursor' do
    get api_v1_sync_url('countries')
    cursor = response.parsed_body['cursor']

    country = Country.create!(name: 'Atlantis', code: 'ATL')
    country.destroy!
    Sync::Tombstone.where(record_id: country.id).update_all(deleted_at: 1.second.from_now)

    get api_v1_sync_url('countries', since: cursor)

    assert_equal [country.id], response.parsed_body['deleted']
  end

  test 'full snapshot does not return tombstones' do
    Sync::Tombstone.create!(resource: 'countries', record_id: 999)

    get api_v1_sync_url('countries')

    assert_empty response.parsed_body['deleted']
  end

  test 'item shapes' do
    get api_v1_sync_url('countries')
    assert_equal %w[code id name updatedAt], response.parsed_body['items'].first.keys.sort

    get api_v1_sync_url('manufacturers')
    assert_equal %w[active code id name updatedAt], response.parsed_body['items'].first.keys.sort

    get api_v1_sync_url('suits')
    assert_equal %w[description id kind manufacturerId name updatedAt], response.parsed_body['items'].first.keys.sort

    get api_v1_sync_url('places')
    place = response.parsed_body['items'].find { |item| item['id'] == places(:kapowsin).id }
    assert_equal(
      { 'name' => 'Kapowsin', 'kind' => 'skydive', 'countryId' => countries(:usa).id,
        'latitude' => 47.24178129, 'longitude' => -123.14310193, 'msl' => 83.0, 'coverPhotoUrl' => nil },
      place.except('id', 'updatedAt')
    )

    get api_v1_sync_url('place_finish_lines')
    line = response.parsed_body['items'].find { |item| item['id'] == place_finish_lines(:hellesylt).id }
    assert_equal places(:hellesylt).id, line['placeId']
    assert_equal({ 'latitude' => 62.0565, 'longitude' => 6.947 }, line['start'])
    assert_equal({ 'latitude' => 62.0547, 'longitude' => 6.9477 }, line['end'])
  end

  test 'responds 410 when cursor was issued before tombstone retention' do
    cursor = Sync::Cursor.new(time: 1.year.ago, id: 1, issued_at: (Sync::TOMBSTONE_RETENTION + 1.day).ago)

    get api_v1_sync_url('places', since: cursor.encode)

    assert_response :gone
    assert_equal({ 'resetRequired' => true }, response.parsed_body)
  end

  test 'responds 400 on malformed cursor' do
    get api_v1_sync_url('places', since: 'not-a-cursor')

    assert_response :bad_request
  end

  test 'responds 404 on unknown resource' do
    get api_v1_sync_url('users')

    assert_response :not_found
  end
end
