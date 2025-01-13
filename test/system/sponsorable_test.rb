require 'application_system_test_case'

class SponsorableTest < ApplicationSystemTestCase
  test 'Competition sponsor' do
    user = create :user
    sign_in user

    competition = create :event, responsible: user
    visit event_path(competition)

    click_link I18n.t('sponsors.list.add_sponsor')

    within '#new_sponsor' do
      fill_in 'sponsor[name]', with: 'Some sponsor'
      fill_in 'sponsor[website]', with: 'http://some.sponsor.com'

      attach_file 'sponsor[logo]', file_fixture('skyderby_logo.png'), make_visible: true

      click_button I18n.t('general.save')
    end

    assert_selector '.sponsors > .sponsor'
  end
end
