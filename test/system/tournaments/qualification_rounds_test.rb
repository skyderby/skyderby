require 'application_system_test_case'

class QualificationRoundsTest < ApplicationSystemTestCase
  test 'add rounds' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)

    visit tournament_qualification_path(tournament)
    click_button 'Round'

    assert_selector 'th', text: 'Round 2'
  end

  test 'delete round' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)
    round = qualification_round(:qualification_1)
    qualification_jumps(:qualification_jump_1).delete

    visit tournament_qualification_path(tournament)

    menu = find("#qual-round-menu-#{round.id}", visible: :all)
    menu.find(:button, I18n.t('general.delete'), visible: :all).execute_script('this.click()')

    assert_no_selector 'th', text: 'Round 1'
  end
end
