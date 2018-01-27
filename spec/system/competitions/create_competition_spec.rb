require 'spec_helper'

feature 'Creating new competitions', type: :system do
  scenario 'Registered user able to create new competition', js: true do
    user = create :user
    sign_in user
    visit events_path
    click_link 'Competition'

    sleep 0.5

    within '#new_event_form' do
      fill_in :event_name, with: 'Test event'
      fill_in :event_range_from, with: 3000
      fill_in :event_range_to, with: 2000

      find('input[type="submit"]').click
    end

    sleep 0.5

    expect(page).to have_css('#event-header h1 span', text: 'Test event')
  end
end
