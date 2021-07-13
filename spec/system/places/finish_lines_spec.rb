describe 'Place finish lines', skip: true do
  it '#index' do
    sign_in users(:admin)

    place = places(:hellesylt)
    finish_line = place_finish_lines(:hellesylt)

    visit place_finish_lines_path(place)

    expect(page).to have_css('.finish-line-card', text: finish_line.name)
  end

  it '#new' do
    sign_in users(:admin)

    place = places(:hellesylt)

    visit new_place_finish_line_path(place)

    expect(page).to have_css('input#place_finish_line_name')
  end

  it '#create', js: true do
    sign_in users(:admin)

    place = places(:hellesylt)

    visit new_place_finish_line_path(place)

    fill_in 'place_finish_line_name', with: 'Some name'
    fill_in 'place_finish_line_start_latitude', with: '1'
    fill_in 'place_finish_line_start_longitude', with: '1'
    fill_in 'place_finish_line_end_latitude', with: '1'
    fill_in 'place_finish_line_end_longitude', with: '1'

    click_button I18n.t('general.save')

    expect(page).to have_css('.finish-line-card', text: 'Some name')
  end

  it '#show' do
    sign_in users(:admin)

    place = places(:hellesylt)
    finish_line = place_finish_lines(:hellesylt)

    visit place_finish_line_path(place, finish_line)
    expect(page).to have_css('h2', text: finish_line.name)
  end

  it '#edit' do
    sign_in users(:admin)

    place = places(:hellesylt)
    finish_line = place_finish_lines(:hellesylt)

    visit edit_place_finish_line_path(place, finish_line)

    expect(page).to have_css('input#place_finish_line_name')
  end

  it '#update', js: true do
    sign_in users(:admin)

    place = places(:hellesylt)
    finish_line = place_finish_lines(:hellesylt)

    visit edit_place_finish_line_path(place, finish_line)

    fill_in 'place_finish_line_name', with: 'ASDFG'

    click_button I18n.t('general.save')

    expect(page).to have_css('.finish-line-card', text: 'ASDFG')
  end

  it '#destroy', js: true do
    sign_in users(:admin)

    place = places(:hellesylt)
    finish_line = place.finish_lines.create(
      name: 'ASDF',
      start_latitude: 1,
      start_longitude: 1,
      end_latitude: 1,
      end_longitude: 1
    )

    visit place_finish_line_path(place, finish_line)
    click_link I18n.t('general.delete')

    expect(page).not_to have_css('.finish-line-card', text: finish_line.name)
  end
end
