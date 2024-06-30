require 'application_system_test_case'

class CreateEventTest < ApplicationSystemTestCase
  test 'create new competition' do
    event_name = 'Speed Skydiving Competition'
    sign_in users(:regular_user)
    visit '/events/speed_skydiving/new'

    fill_in 'name', with: event_name

    find('[aria-label="Select place"]').send_keys :arrow_down
    first('span', exact_text: 'DZ Ravenna').click

    click_button I18n.t('general.save')

    assert_selector 'h2', text: event_name.upcase
    assert_selector 'span', text: 'Scoreboard'
    assert_selector 'span', text: 'Edit'
  end
end
