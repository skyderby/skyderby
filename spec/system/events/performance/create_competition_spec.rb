describe 'Create GPS Performance Competition Page' do
  it 'create new competition' do
    sign_in users(:regular_user)
    visit '/events/performance/new'

    fill_in 'name', with: 'GPS Performance'
    fill_in 'rangeFrom', with: 2500
    fill_in 'rangeTo', with: 1500

    find('[aria-label="Select place"]').send_keys :arrow_down
    first('span', exact_text: 'DZ Ravenna').click

    click_button I18n.t('general.save')

    expect(page).to have_css('h2', text: 'GPS Performance')
    expect(page).to have_css('span', text: 'Scoreboard')
    expect(page).to have_css('span', text: 'Reference points')
    expect(page).to have_css('span', text: 'Edit')
  end
end
