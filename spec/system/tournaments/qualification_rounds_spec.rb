feature 'Qualification rounds', type: :system, js: true do
  scenario 'add rounds' do
    sign_in user

    tournament = create :tournament,
                        responsible: user,
                        has_qualification: true

    visit tournament_qualification_path(tournament)
    click_button 'Round'

    expect(page).to have_css('td', text: 'Round 1')
  end

  scenario 'delete round' do
    sign_in user

    tournament = create :tournament,
                        responsible: user,
                        has_qualification: true

    create :qualification_round, tournament: tournament

    visit tournament_qualification_path(tournament)

    # open dropdown
    find('.round-cell__actions .btn-link').click
    click_button I18n.t('general.delete')

    expect(page).to have_no_css('td', text: 'Round 1')
  end

  def user
    @user ||= create :user
  end
end
