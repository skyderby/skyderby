describe 'Edit performance competition event' do
  it 'updates event' do
    event = events(:published_public)
    event.update!(name: 'OLD NAME')
    new_event_name = 'NEW EVENT NAME'

    sign_in event.responsible
    visit "/events/performance/#{event.id}/edit"

    expect(page).to have_css('h2', text: 'OLD NAME')

    fill_in 'name', with: new_event_name
    click_button I18n.t('general.save')

    expect(page).to have_css('h2', text: new_event_name)
  end

  it 'redirects to event on cancel' do
    event = events(:published_public)
    event.update!(name: 'EVENT NAME')

    sign_in event.responsible
    visit "/events/performance/#{event.id}/edit"
    click_link I18n.t('general.cancel')

    expect(page).to have_current_path("/events/performance/#{event.id}")
    expect(page).to have_css('h2', text: 'EVENT NAME')
  end

  it 'displays error when not allowed to access the page' do
    event = events(:published_public)

    visit "/events/performance/#{event.id}/edit"

    expect(page).to have_text("You're not allowed to view this page.")
  end
end
