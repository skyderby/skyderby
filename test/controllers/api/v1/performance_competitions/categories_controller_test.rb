require 'test_helper'

class Api::V1::PerformanceCompetitions::CategoriesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create adds a category and changes the event detail' do
    get api_v1_performance_competition_path(@event)
    etag = response.headers['ETag']

    travel 1.minute do
      post api_v1_performance_competition_categories_path(@event),
           params: { category: { name: 'Open', event_id: events(:boogie).id } },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    assert_equal 'Open', response.parsed_body['name']
    assert_equal @event, PerformanceCompetition::Category.find(response.parsed_body['id']).event

    get api_v1_performance_competition_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
  end

  test '#create returns validation errors' do
    post api_v1_performance_competition_categories_path(@event),
         params: { category: { name: '' } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_categories_path(@event),
         params: { category: { name: 'Open' } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end

  test '#update renames a category' do
    patch api_v1_performance_competition_category_path(@event, event_sections(:advanced)),
          params: { category: { name: 'Pro' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal 'Pro', event_sections(:advanced).reload.name
  end

  test '#destroy removes an empty category' do
    delete api_v1_performance_competition_category_path(@event, event_sections(:intermediate)),
           headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not PerformanceCompetition::Category.exists?(event_sections(:intermediate).id)
  end

  test '#destroy refuses a category with competitors' do
    delete api_v1_performance_competition_category_path(@event, event_sections(:advanced)),
           headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end
end
