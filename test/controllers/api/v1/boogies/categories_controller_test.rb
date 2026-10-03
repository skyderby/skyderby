require 'test_helper'

class Api::V1::Boogies::CategoriesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
    @category = Boogie::Category.find(ActiveRecord::FixtureSet.identify(:boogie_open))
  end

  test '#create adds a category visible in the detail' do
    get api_v1_boogie_path(@boogie), headers: bearer(:event_responsible_write)
    etag = response.headers['ETag']

    post api_v1_boogie_categories_path(@boogie), params: { category: { name: 'Advanced', event_id: 0 } },
                                                 headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    assert_equal 'Advanced', response.parsed_body['name']
    assert_equal @boogie.id, Boogie::Category.find(response.parsed_body['id']).event_id

    get api_v1_boogie_path(@boogie), headers: bearer(:event_responsible_write).merge('If-None-Match' => etag)

    assert_response :success
    assert_includes response.parsed_body['categories'].pluck('name'), 'Advanced'
  end

  test '#create returns validation errors' do
    post api_v1_boogie_categories_path(@boogie), params: { category: { name: '' } },
                                                 headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update renames a category' do
    patch api_v1_boogie_category_path(@boogie, @category), params: { category: { name: 'Open' } },
                                                           headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal 'Open', @category.reload.name
  end

  test '#destroy refuses a category with competitors' do
    delete api_v1_boogie_category_path(@boogie, @category), headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#destroy removes an empty category' do
    category = @boogie.categories.create!(name: 'Empty')

    delete api_v1_boogie_category_path(@boogie, category), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not Boogie::Category.exists?(category.id)
  end

  test '#create is forbidden for non editors' do
    post api_v1_boogie_categories_path(@boogie), params: { category: { name: 'Advanced' } },
                                                 headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
