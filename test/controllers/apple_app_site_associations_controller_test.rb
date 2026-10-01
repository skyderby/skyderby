require 'test_helper'

class AppleAppSiteAssociationsControllerTest < ActionDispatch::IntegrationTest
  test '#show lists app ids and shareable paths' do
    get apple_app_site_association_path

    assert_response :success
    assert_equal 'application/json', response.media_type
    details = response.parsed_body.dig('applinks', 'details').first
    assert_includes details['appIDs'], 'RT5237MTWU.io.skyderby.app'
    assert_includes details['components'], { '/' => '/tracks/*' }
  end
end
