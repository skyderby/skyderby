require 'application_system_test_case'

class SponsorableTest < ApplicationSystemTestCase
  test 'Competition sponsor' do
    user = users(:event_responsible)
    sign_in user

    competition = create :event, responsible: user
    visit performance_competition_path(competition)

    click_button I18n.t('sponsors.list.add_sponsor')

    fill_in 'sponsor[name]', with: 'Some sponsor'
    fill_in 'sponsor[website]', with: 'http://some.sponsor.com'

    attach_file 'sponsor[logo]', file_fixture('skyderby_logo.png'), make_visible: true

    click_button I18n.t('general.save')

    assert_selector '.sponsors-list > .sponsor'
  end
end
