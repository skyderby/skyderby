describe 'Events - Speed Skydiving - Edit' do
  let(:event) { speed_skydiving_competitions(:nationals) }

  it 'with valid values' do
    new_event_name = 'Changed event name'

    sign_in event.responsible
    visit "/events/speed_skydiving/#{event.id}"

    click_link I18n.t('general.edit')

    fill_in 'name', with: new_event_name

    click_button I18n.t('general.save')

    expect(page).to have_css('h2', text: new_event_name.upcase)
  end
end
