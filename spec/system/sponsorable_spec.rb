describe 'Sponsorable', js: true, skip: true do
  it 'Competition sponsor' do
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

    expect(page).to have_css('#sponsors > .sponsor')
  end
end
