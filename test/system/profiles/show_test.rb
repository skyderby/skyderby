require 'application_system_test_case'

class ShowProfileTest < ApplicationSystemTestCase
  test 'Guest user view profile' do
    profile = create :profile
    visit profile_path(profile)

    assert_text profile.name
  end

  test 'Guest user views event profile' do
    event = create :event
    profile = create :profile, owner: event

    visit profile_path(profile)

    assert_text profile.name
  end
end
