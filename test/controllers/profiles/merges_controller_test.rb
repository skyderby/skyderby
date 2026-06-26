require 'test_helper'

class Profiles::MergesControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
    @profile = Profile.create!(name: 'Anchor')
    @other = Profile.create!(name: 'Other')
  end

  test 'default direction merges selected profile into current profile' do
    post profile_merge_path(@profile),
         params: { profiles_merge: { other_profile_id: @other.id } }, as: :turbo_stream

    assert_response :success
    assert_includes @profile.reload.aliases.pluck(:name), 'Other'
    assert_empty @other.reload.aliases
  end

  test 'flipped direction merges current profile into selected profile' do
    post profile_merge_path(@profile),
         params: { profiles_merge: { other_profile_id: @other.id, flip: '1' } }, as: :turbo_stream

    assert_response :success
    assert_includes @other.reload.aliases.pluck(:name), 'Anchor'
    assert_empty @profile.reload.aliases
  end
end
