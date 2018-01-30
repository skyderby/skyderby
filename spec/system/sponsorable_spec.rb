require 'spec_helper'

feature 'Sponsorable', type: :system, js: true do
  scenario 'Competition sponsor' do
    user = create :user
    sign_in user

    competition = create :event, responsible: user.profile
    visit event_path(competition)

    click_link I18n.t('events.show.add_sponsor')

    within '#new_sponsor' do
      fill_in 'sponsor[name]', with: 'Some sponsor'
      fill_in 'sponsor[website]', with: 'http://some.sponsor.com'

      attach_file 'sponsor[logo]',
                  Rails.root.join('spec', 'support', 'skyderby_logo.png'),
                  make_visible: true

      click_button I18n.t('general.save')
    end

    expect(page).to have_css('#sponsors > .sponsor')
  end
end
