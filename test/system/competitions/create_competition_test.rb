feature 'Creating new competitions', type: :system, skip: true do
  scenario 'Registered user able to create new competition', js: true do
    sign_in users(:regular_user)
    visit events_path

    click_link 'Competition'
    expect(page).to have_css('.modal-title', text: "#{I18n.t('activerecord.models.event')}: New")

    fill_in :event_name, with: 'Test event'
    fill_in :event_range_from, with: 3000
    fill_in :event_range_to, with: 2000
    select2 places(:hellesylt_wbr).name, from: 'event_place_id'

    find('input[type="submit"]').click

    expect(page).to have_css('#event-header h1 span', text: 'Test event')
  end
end
