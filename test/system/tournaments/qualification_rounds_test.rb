require 'application_system_test_case'

class QualificationRoundsTest < ApplicationSystemTestCase
  test 'add rounds' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)

    visit tournament_qualification_path(tournament)
    click_button 'Round'

    assert_selector 'td', text: 'Round 2'
  end

  test 'delete round' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)
    qualification_jumps(:qualification_jump_1).delete

    visit tournament_qualification_path(tournament)

    # open dropdown
    find('.scoreboard-round-actions .button--ghost').click
    click_button I18n.t('general.delete')

    assert_no_selector 'td', text: 'Round 1'
  end
end
