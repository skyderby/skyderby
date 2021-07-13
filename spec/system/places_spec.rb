describe 'Adding place', type: :system, skip: true do
  it 'Non admin user do not see add button' do
    visit places_path
    expect(page).not_to have_css('a', text: I18n.t('places.index.new'))
  end

  it 'Admin user can add place', js: true do
    user = create :user, :admin
    sign_in user

    country = countries(:norway)

    visit places_path
    click_link I18n.t('places.index.new')

    within '#new_place' do
      fill_in 'place[name]', with: 'Gridset'
      fill_in 'place[latitude]', with: '62.5203062'
      fill_in 'place[longitude]', with: '7.5773933'
    end

    select2 country.name, from: :place_country_id

    click_button I18n.t('general.save')

    expect(page).to have_content('Gridset')
  end
end
