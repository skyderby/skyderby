require 'test_helper'

class Api::V1::Logbook::Jumps::RenumberingsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#create renumbers the following jumps' do
    profile = profiles(:regular_user)
    first = profile.jumps.create!(number: 10, jumped_at: 3.days.ago)
    following = profile.jumps.create!(number: 5, jumped_at: 2.days.ago)

    post api_v1_logbook_jump_renumbering_path(first.client_uuid), headers: bearer(:regular_user_write)

    assert_response :no_content
    assert_equal 11, following.reload.number
  end
end
