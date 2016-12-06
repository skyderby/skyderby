require 'spec_helper'

feature 'Sponsorable', js: true do
  scenario 'Competition sponsor' do
    user = create :user
    sign_in user

    competition = create :event, responsible: user.profile
    visit event_path(competition)

    click_link I18n.t('events.show.add_sponsor')
    sleep 0.5 # modal open

    within '#new_sponsor' do
      fill_in 'sponsor[name]', with: 'Some sponsor'
      fill_in 'sponsor[website]', with: 'http://some.sponsor.com'

      page.execute_script("$('#sponsor_logo').css({opacity: 100})")
      attach_file 'sponsor[logo]', "#{Rails.root}/spec/support/skyderby_logo.png"

      click_button I18n.t('general.save')
    end
    sleep 0.5 # modal close

    expect(page).to have_css('#sponsors > .sponsor')
  end
end
