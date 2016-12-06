require 'spec_helper'

feature 'Permissions: Competitions' do
  scenario 'User can view published and finished competitions' do
    event = create :event
    event.published!

    visit event_path(event)
    expect(page).to have_content(event.name)
  end

  scenario 'User can not view draft competitions' do
    event = create :event
    event.draft!

    visit event_path(event)
    expect(page).to have_content('You are not authorized to access this page')

  end
end
