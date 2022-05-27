describe 'Create location page:' do
  it 'regular user can not see + button' do
    sign_in users(:regular_user)
    visit '/places'

    expect(page).not_to have_link(href: '/places/new')
  end

  it 'regular user is redirected back to /places' do
    sign_in users(:regular_user)
    visit '/places/new'

    expect(page).to have_current_path('/places')
  end

  it 'admin user can see + button' do
    sign_in users(:admin)
    visit '/places'

    expect(page).to have_link(href: '/places/new')
  end

  it 'admin user is not redirected back to /places' do
    sign_in users(:admin)
    visit '/places'
    find("a[href='/places/new']").click

    expect(page).to have_current_path('/places/new')
  end

  it 'cancel button navigates to place index' do
    sign_in users(:admin)
    visit('/places/new')

    click_link I18n.t('general.cancel')

    expect(page).to have_current_path('/places')
  end

  it 'admin user is able to fill the form and save new place' do
    sign_in users(:admin)
    visit '/places'
    find("a[href='/places/new']").click

    fill_in 'name', with: 'New test location'
    choose(option: 'base', allow_label_click: true)
    find('[aria-label="Select country"').send_keys :arrow_down
    first('div', exact_text: 'Russia').click
    fill_in 'latitude', with: 55.168499
    fill_in 'longitude', with: 38.689909
    fill_in 'msl', with: 16.25

    click_button I18n.t('general.save')

    place_id = Place.last.id

    expect(page).to have_current_path("/places/#{place_id}")
    expect(page).to have_css('h2', text: 'New test location')
    expect(page).to have_css('span', text: 'Overview')
    expect(page).to have_css('span', text: 'Videos')
    expect(page).to have_css('span', text: 'Track')
  end
end
