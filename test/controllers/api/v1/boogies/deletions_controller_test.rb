require 'test_helper'

class Api::V1::Boogies::DeletionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
  end

  test '#create deletes the boogie keeping tracks' do
    assert_no_difference -> { Track.count } do
      post api_v1_boogie_deletion_path(@boogie), params: { event_deletion: { event_name: 'Hungary Boogie' } },
                                                 headers: bearer(:event_responsible_write), as: :json
    end

    assert_response :no_content
    assert_not Boogie.exists?(@boogie.id)
  end

  test '#create deletes the boogie including tracks' do
    assert_difference -> { Track.count }, -5 do
      post api_v1_boogie_deletion_path(@boogie),
           params: { event_deletion: { event_name: 'Hungary Boogie', delete_tracks: true } },
           headers: bearer(:event_responsible_write), as: :json
    end

    assert_response :no_content
  end

  test '#create rejects a mismatching name' do
    post api_v1_boogie_deletion_path(@boogie), params: { event_deletion: { event_name: 'Wrong' } },
                                               headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert Boogie.exists?(@boogie.id)
  end

  test '#create is forbidden for organizers who are not responsible' do
    @boogie.organizers.create!(user: users(:regular_user))

    post api_v1_boogie_deletion_path(@boogie), params: { event_deletion: { event_name: 'Hungary Boogie' } },
                                               headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
    assert Boogie.exists?(@boogie.id)
  end
end
