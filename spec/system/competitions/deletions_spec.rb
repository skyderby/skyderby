feature 'Deletion event', type: :system, js: true do
  scenario 'responsible delete his own competition' do
    user = create :user
    event = create :event, name: 'event_to_delete', responsible: user

    sign_in user
    visit event_path(event)
    click_link I18n.t('general.edit')
    sleep 0.5
    page.save_screenshot(Rails.root.join('tmp', 'page.png'), full: true)
    click_link I18n.t('general.delete')
    sleep 0.5
    fill_in 'event_deletion_event_name', with: event.name
    click_button I18n.t('general.delete')

    expect(page).not_to have_content(event.name)
  end
end
