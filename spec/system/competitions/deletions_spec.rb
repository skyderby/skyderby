feature 'Deletion event', type: :system, js: true, skip: true do
  scenario 'responsible delete his own competition' do
    user = create :user
    event = create :event, name: 'event_to_delete', responsible: user

    sign_in user
    visit event_path(event)
    click_link I18n.t('general.edit')
    click_link I18n.t('general.delete')
    fill_in 'event_deletion_event_name', with: event.name
    click_button I18n.t('general.delete')

    expect(page).not_to have_content(event.name)
  end
end
