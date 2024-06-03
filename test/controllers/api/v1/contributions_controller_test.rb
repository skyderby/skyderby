require 'test_helper'

class Api::V1::ContributionsControllerTest < ActionDispatch::IntegrationTest
  test '#index - forbidden for non-admin users' do
    get api_v1_contributions_url

    assert_response :forbidden
  end

  test '#index - returns list of contributions for admin users' do
    sign_in users(:admin)
    profiles(:regular_user).contributions.create!(amount: '10.2', received_at: '2024-01-01')

    get api_v1_contributions_url

    assert_response :success
    assert_equal 1, response.parsed_body['currentPage']
    assert_equal 1, response.parsed_body['totalPages']
    assert_equal 1, response.parsed_body['items'].count
    contribution = response.parsed_body['items'][0]
    assert_in_delta 10.2, contribution['amount']
    assert_equal '2024-01-01', contribution['receivedAt']
  end
end
