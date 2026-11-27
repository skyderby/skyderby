require 'test_helper'

class FlysightConfigsControllerTest < ActionDispatch::IntegrationTest
  test '#show explains a shared FlySight config link' do
    get flysight_config_path

    assert_response :success
    assert_select 'article[data-controller="flysight-config"]'
  end
end
