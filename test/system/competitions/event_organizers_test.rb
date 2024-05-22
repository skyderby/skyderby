feature 'Event organizers', type: :system, js: true, skip: true do
  scenario 'add organizer' do
    event = events(:published_public)
    organizer = users(:regular_user)

    sign_in users(:event_responsible)
    visit event_path(event)

    click_link I18n.t('organizers.list.add_judge')
    expect(page).to have_css('.modal-title', text: "#{I18n.t('activerecord.models.organizer')}: New")

    select2 organizer.name, from: 'organizer_user_id'

    click_button I18n.t('general.save')
    expect(page).not_to have_css('.modal-title', text: "#{I18n.t('activerecord.models.organizer')}: New")

    expect(page).to have_content(organizer.name)
  end
end
