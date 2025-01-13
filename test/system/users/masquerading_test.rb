require 'application_system_test_case'

class MasqueradingTest < ApplicationSystemTestCase
  test 'Admin can masquerade as another user' do
    admin = create :user, :admin
    user  = create :user

    sign_in admin
    visit profile_path(user.profile)
    click_link 'Masquerade'

    assert_text 'Now masquerading as'
  end
end
