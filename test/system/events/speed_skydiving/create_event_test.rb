describe 'Create Speed Skydiving competition' do
  it 'create new competition' do
    event_name = 'Speed Skydiving Competition'
    sign_in users(:regular_user)
    visit '/events/speed_skydiving/new'

    fill_in 'name', with: event_name

    find('[aria-label="Select place"]').send_keys :arrow_down
    first('span', exact_text: 'DZ Ravenna').click

    click_button I18n.t('general.save')

    expect(page).to have_css('h2', text: event_name.upcase)
    expect(page).to have_css('span', text: 'Scoreboard')
    expect(page).to have_css('span', text: 'Edit')
  end
end
