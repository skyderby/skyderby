require 'test_helper'

class Api::V1::BoogiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
  end

  test '#show returns boogie details' do
    get api_v1_boogie_path(@boogie)

    assert_response :success
    body = response.parsed_body
    assert_equal 'boogie', body['type']
    assert_equal 2, body['numberOfResultsForTotal']
    assert_equal ['Boogie Open'], body['categories'].pluck('name')
    assert_equal [1, 2], body['rounds'].pluck('number')
    assert_equal 4, body['competitors'].size
  end

  test '#show returns not found for drafts' do
    @boogie.update_column(:status, :draft)

    get api_v1_boogie_path(@boogie)

    assert_response :not_found
  end
end
