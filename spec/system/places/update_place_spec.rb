describe 'Edit place page:' do
  let(:place) { places(:ravenna) }

  it 'regular user can not see edit button' do
    sign_in users(:regular_user)
    visit "/places/#{place.id}"

    expect(page).not_to have_link(href: "/places/#{place.id}/edit")
  end

  it 'regular user is redirected back to /places' do
    sign_in users(:regular_user)
    visit "/places/#{place.id}/edit"

    expect(page).to have_current_path("/places/#{place.id}")
  end

  it 'admin user can see edit button' do
    sign_in users(:admin)
    visit "/places/#{place.id}"

    expect(page).to have_link(href: "/places/#{place.id}/edit")
  end

  it 'admin user is able to fill the form and update place' do
    sign_in users(:admin)
    visit "/places/#{place.id}"
    click_link I18n.t('general.edit')

    fill_in 'name', with: 'New name'
    choose(option: 'base', allow_label_click: true)
    find('[aria-label="Select country"').send_keys :arrow_down
    first('div', exact_text: 'Russia').click
    fill_in 'latitude', with: 55.168499
    fill_in 'longitude', with: 38.689909
    fill_in 'msl', with: 16.25

    click_button I18n.t('general.save')

    expect(page).to have_current_path("/places/#{place.id}")
    expect(page).to have_css('h2', text: 'New name')
    expect(page).to have_text('Lat: 55.168499')
    expect(page).to have_text('Lon: 38.689909')
    expect(page).to have_text('MSL: 16.3 m')
  end

  it 'admin user can delete' do
    place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127

    sign_in users(:admin)
    visit "/places/#{place.id}"
    click_link I18n.t('general.edit')
    click_button I18n.t('general.delete')

    expect(page).to have_current_path('/places')
    expect(page).to have_text('Place had been successfully deleted')
    expect(Place.find_by(id: place.id)).to eq(nil)
  end

  it 'can not be deleted if track reference it', :aggregate_failures do
    place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127
    create :empty_track, place: place

    sign_in users(:admin)
    visit "/places/#{place.id}"
    click_link I18n.t('general.edit')
    click_button I18n.t('general.delete')

    expect(page).to have_current_path("/places/#{place.id}/edit")
    expect(page).to have_text('Cannot delete record because dependent tracks exist')
    expect(Place.find_by(id: place.id)).not_to eq(nil)
  end
end
