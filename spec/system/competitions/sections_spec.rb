feature 'Event sections (categories)', type: :system, js: true, skip: true do
  scenario 'add section' do
    user = create :user
    event = create(:event,
                   status: Event.statuses[:published],
                   visibility: Event.visibilities[:public_event],
                   responsible: user)

    sign_in user
    visit event_path(event)

    click_link I18n.t('activerecord.models.event/section')

    fill_in :section_name, with: 'Category: Open'

    click_button I18n.t('general.save')
    sleep 0.5

    expect(page).to have_css('td .section-name', text: 'CATEGORY: OPEN')
  end
end
