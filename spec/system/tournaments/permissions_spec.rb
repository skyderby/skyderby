feature 'Tournaments permissions', type: :system, skip: true do
  scenario 'Not logged in user can not acess new action' do
    visit new_tournament_path

    expect(page).to have_content 'You are not authorized to access this page.'
  end

  scenario 'Not logged in user can not acess new action' do
    tournament = tournaments(:world_base_race)
    visit edit_tournament_path(tournament)

    expect(page).to have_content 'You are not authorized to access this page.'
  end
end
