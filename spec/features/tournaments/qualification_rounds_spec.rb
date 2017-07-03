feature 'Qualification rounds', js: true do
  scenario 'add rounds' do
    user = create :user
    sign_in user

    tournament = create :tournament,
                        responsible: user.profile,
                        has_qualification: true

    visit tournament_qualification_path(tournament)
    click_button 'Round'

    expect(page).to have_css('td', text: 'Round 1')
  end
end
