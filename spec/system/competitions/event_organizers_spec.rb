feature 'Event organizers', type: :system, js: true do
  scenario 'add organizer' do
    user = create :user
    event = create(:event,
                   status: Event.statuses[:published],
                   visibility: Event.visibilities[:public_event],
                   responsible: user.profile)

    organizer = create :user

    sign_in user
    visit event_path(event)

    click_link I18n.t('events.show.add_judge')

    find('#select2-organizer_profile_id-container').click
    sleep 0.5
    first('li.select2-results__option', text: organizer.name).click
    sleep 0.5

    click_button I18n.t('general.save')
    sleep 0.5

    expect(page).to have_content(organizer.name)
  end
end
