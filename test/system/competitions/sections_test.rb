require 'application_system_test_case'

class EventSectionsTest < ApplicationSystemTestCase
  test 'add section' do
    user = users(:event_responsible)
    event = create(:event,
                   status: Event.statuses[:published],
                   visibility: Event.visibilities[:public_event],
                   responsible: user)

    sign_in user
    visit performance_competition_path(event)

    click_button I18n.t('activerecord.models.event/section')

    fill_in :section_name, with: 'Category: Open'

    click_button I18n.t('general.save')
    sleep 0.5

    assert_selector('td .section-name', text: 'CATEGORY: OPEN')
  end
end
