require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::CategoriesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @category = speed_skydiving_competition_categories(:male)
  end

  test '#create adds a category visible in the detail' do
    get api_v1_speed_skydiving_competition_path(@event)
    etag = response.headers['ETag']

    post api_v1_speed_skydiving_competition_categories_path(@event),
         params: { category: { name: 'Juniors', event_id: 0 } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    assert_equal 'Juniors', response.parsed_body['name']

    get api_v1_speed_skydiving_competition_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
    assert_includes response.parsed_body['categories'].pluck('name'), 'Juniors'
  end

  test '#create reports validation errors' do
    post api_v1_speed_skydiving_competition_categories_path(@event),
         params: { category: { name: '' } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update renames a category' do
    patch api_v1_speed_skydiving_competition_category_path(@event, @category),
          params: { category: { name: 'Open' } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal 'Open', @category.reload.name
  end

  test '#destroy refuses a category with competitors' do
    delete api_v1_speed_skydiving_competition_category_path(@event, @category),
           headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#destroy removes an empty category' do
    category = @event.categories.create!(name: 'Empty')

    delete api_v1_speed_skydiving_competition_category_path(@event, category),
           headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not SpeedSkydivingCompetition::Category.exists?(category.id)
  end

  test '#update is forbidden for non-editors' do
    patch api_v1_speed_skydiving_competition_category_path(@event, @category),
          params: { category: { name: 'Open' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
    assert_equal 'Male', @category.reload.name
  end
end
