require 'test_helper'

class Api::V1::Boogies::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
    @category = Boogie::Category.find(ActiveRecord::FixtureSet.identify(:boogie_open))
    @competitor = Boogie::Competitor.find(ActiveRecord::FixtureSet.identify(:boogie_john))
  end

  test '#create adds a competitor with an existing profile' do
    post api_v1_boogie_competitors_path(@boogie),
         params: { competitor: { category_id: @category.id, suit_id: suits(:nala).id,
                                 profile_id: profiles(:regular_user).id, assigned_number: '7' } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    body = response.parsed_body
    assert_equal @category.id, body['categoryId']
    assert_equal profiles(:regular_user).id, body.dig('profile', 'id')
    assert_equal '7', body['assignedNumber']
    assert_not body['profileOwnedByEvent']
  end

  test '#create adds a competitor with an event owned profile' do
    assert_difference -> { Profile.count }, 1 do
      post api_v1_boogie_competitors_path(@boogie),
           params: { competitor: { category_id: @category.id, suit_id: suits(:nala).id,
                                   profile_attributes: { name: 'Brand New Pilot',
                                                         country_id: countries(:italy).id } } },
           headers: bearer(:event_responsible_write), as: :json
    end

    assert_response :created
    assert response.parsed_body['profileOwnedByEvent']
    assert_equal @boogie, Profile.find(response.parsed_body.dig('profile', 'id')).owner
  end

  test '#create rejects a category of another event' do
    other = Boogie::Category.find(ActiveRecord::FixtureSet.identify(:advanced))

    post api_v1_boogie_competitors_path(@boogie),
         params: { competitor: { category_id: other.id, suit_id: suits(:nala).id, profile_id: profiles(:maynard).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :not_found
  end

  test '#create returns validation errors' do
    post api_v1_boogie_competitors_path(@boogie),
         params: { competitor: { category_id: @category.id, profile_id: profiles(:maynard).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update changes suit and number' do
    patch api_v1_boogie_competitor_path(@boogie, @competitor),
          params: { competitor: { suit_id: suits(:nala).id, assigned_number: '12' } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    @competitor.reload
    assert_equal suits(:nala), @competitor.suit
    assert_equal '12', @competitor.assigned_number.to_s
  end

  test '#destroy refuses a competitor with results' do
    delete api_v1_boogie_competitor_path(@boogie, @competitor), headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#destroy removes a competitor without results' do
    competitor = @boogie.competitors.create!(category: @category, suit: suits(:nala), profile: profiles(:maynard))

    delete api_v1_boogie_competitor_path(@boogie, competitor), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not Boogie::Competitor.exists?(competitor.id)
  end

  test '#update is forbidden for non editors' do
    patch api_v1_boogie_competitor_path(@boogie, @competitor), params: { competitor: { assigned_number: '12' } },
                                                               headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end

  test '#update edits name and country of an event owned profile' do
    profile = Profile.create!(name: 'Event Pilot', owner: @boogie, country: countries(:norway))
    competitor = @boogie.competitors.create!(category: @category, suit: suits(:nala), profile:)

    patch api_v1_boogie_competitor_path(@boogie, competitor),
          params: { competitor: { profile_attributes: { name: 'Renamed Pilot', country_id: countries(:italy).id } } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    profile.reload
    assert_equal 'Renamed Pilot', profile.name
    assert_equal countries(:italy), profile.country
    assert_equal profile, competitor.reload.profile
  end
end
