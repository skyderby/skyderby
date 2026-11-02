require 'test_helper'

class AndroidAssetLinksControllerTest < ActionDispatch::IntegrationTest
  test '#show lists the package and signing fingerprints' do
    get android_asset_links_path

    assert_response :success
    assert_equal 'application/json', response.media_type
    statement = response.parsed_body.first
    assert_includes statement['relation'], 'delegate_permission/common.handle_all_urls'
    assert_equal 'io.skyderby.android', statement.dig('target', 'package_name')
    assert_includes statement.dig('target', 'sha256_cert_fingerprints'),
                    '1B:BD:11:EA:6F:03:EE:01:0A:84:40:E1:3A:53:D4:DA:8A:B9:AB:02:0D:4F:48:19:70:0F:30:BF:DC:A7:BE:27'
  end
end
