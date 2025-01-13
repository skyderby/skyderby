require 'application_system_test_case'

class DeletionEventTest < ApplicationSystemTestCase
  test 'responsible delete his own competition' do
    user = create :user
    event = create :event, name: 'event_to_delete', responsible: user

    sign_in user
    visit event_path(event)
    click_link I18n.t('general.edit')
    click_link I18n.t('general.delete')
    fill_in 'event_deletion_event_name', with: event.name
    click_button I18n.t('general.delete')

    assert_no_text event.name
  end
end
