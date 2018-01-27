require 'spec_helper'

feature 'Permissions: Competitions', type: :system do
  scenario 'User can view published and finished competitions' do
    event = create :event
    event.public_event!
    event.published!

    visit event_path(event)
    expect(page).to have_content(event.name)
  end

  scenario 'User can view competition if he compete in it' do
    event = create :event
    event.private_event!
    event.published!

    user = create :user
    competitor = create :competitor, event: event, profile: user.profile

    sign_in user
    visit event_path(event)

    expect(page).to have_content(event.name)
  end

  scenario 'User can not view public draft competitions' do
    event = create :event
    event.public_event!
    event.draft!

    visit event_path(event)
    expect(page).to have_content('You are not authorized to access this page')
  end

  scenario 'User can not view private finished competitions' do
    event = create :event
    event.private_event!
    event.finished!

    visit event_path(event)
    expect(page).to have_content('You are not authorized to access this page')
  end
end
