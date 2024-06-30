require 'application_system_test_case'

class CreateCompetitionTest < ApplicationSystemTestCase
  test 'create new competition' do
    sign_in users(:regular_user)
    visit '/events/performance/new'

    fill_in 'name', with: 'GPS Performance'
    fill_in 'rangeFrom', with: 2500
    fill_in 'rangeTo', with: 1500

    find('[aria-label="Select place"]').send_keys :arrow_down
    first('span', exact_text: 'DZ Ravenna').click

    click_button I18n.t('general.save')

    assert_selector 'h2', text: 'GPS Performance'
    assert_selector 'span', text: 'Scoreboard'
    assert_selector 'span', text: 'Reference points'
    assert_selector 'span', text: 'Edit'
  end
end
