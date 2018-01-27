feature 'Tournaments permissions', type: :system do
  scenario 'Not logged in user can not acess new action' do
    visit new_tournament_path

    expect(page).to have_content 'You are not authorized to access this page.'
  end

  scenario 'Not logged in user can not acess new action' do
    tournament = create :tournament
    visit edit_tournament_path(tournament)

    expect(page).to have_content 'You are not authorized to access this page.'
  end
end
