describe 'Qualification rounds', js: true, skip: true do
  it 'add rounds' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)

    visit tournament_qualification_path(tournament)
    click_button 'Round'

    expect(page).to have_css('td', text: 'Round 2')
  end

  it 'delete round' do
    sign_in users(:regular_user)

    tournament = tournaments(:qualification_loen)
    qualification_jumps(:qualification_jump_1).delete

    visit tournament_qualification_path(tournament)

    # open dropdown
    find('.scoreboard-round-actions .btn-link').click
    click_button I18n.t('general.delete')

    expect(page).to have_no_css('td', text: 'Round 1')
  end
end
