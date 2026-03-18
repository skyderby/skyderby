require 'application_system_test_case'

class BadgesTest < ApplicationSystemTestCase
  test 'Index' do
    badge = create :badge
    sign_in admin_user

    visit badges_path

    assert_text badge.name
  end

  test 'Update' do
    create :badge, name: 'WWL 2020'

    sign_in admin_user

    visit badges_path
    click_link I18n.t('general.edit'), visible: false
    fill_in 'badge[name]', with: 'WBR 2020'
    click_button I18n.t('general.save')

    assert_text 'WBR 2020'
  end

  test 'Delete' do
    create :badge, name: 'WWL 2020'

    sign_in admin_user

    visit badges_path
    accept_alert do
      click_link I18n.t('general.delete'), visible: false
    end

    assert_no_text 'WBR 2020'
  end

  def admin_user
    @admin_user ||= users(:admin)
  end
end
