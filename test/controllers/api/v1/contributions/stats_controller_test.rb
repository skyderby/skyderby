require 'test_helper'

class Api::Web::Contributions::StatsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @profile = profiles(:regular_user)
    @admin = users(:admin)
    @regular_user = users(:regular_user)
  end

  test 'shows correct stats for admin' do
    @profile.contributions.create!(amount: 10, received_at: Time.current)
    @profile.contributions.create!(amount: 20, received_at: 2.months.ago)
    @profile.contributions.create!(amount: 30, received_at: 4.months.ago)
    @profile.contributions.create!(amount: 50, received_at: 2.years.ago)

    sign_in @admin

    get api_v1_contributions_stats_url

    assert_response :success
    assert_equal 10, response.parsed_body['thisMonthAmount']
    assert_equal 30, response.parsed_body['past90DaysAmount']
    assert_equal 60, response.parsed_body['pastYearAmount']
  end

  test 'returns 0 when no contributions' do
    sign_in @admin

    get api_v1_contributions_stats_url

    assert_equal 0, response.parsed_body['thisMonthAmount']
    assert_equal 0, response.parsed_body['past90DaysAmount']
    assert_equal 0, response.parsed_body['pastYearAmount']
  end

  test 'forbidden for non-admin users' do
    sign_in @regular_user
    get api_v1_contributions_stats_url

    assert_response :forbidden
    assert_equal({ 'errors' => { 'base' => ['forbidden'] } }, response.parsed_body)
  end
end
