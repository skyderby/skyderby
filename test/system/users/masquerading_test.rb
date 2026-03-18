require 'application_system_test_case'

class MasqueradingTest < ApplicationSystemTestCase
  test 'Admin can masquerade as another user' do
    admin = users(:admin)
    user  = users(:regular_user)

    sign_in admin
    visit profile_path(user.profile)
    click_button 'Masquerade'

    assert_text 'Now masquerading as'
  end
end
