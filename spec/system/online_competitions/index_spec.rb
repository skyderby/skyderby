describe 'index', skip: true do
  it 'shows competitions' do
    competition = create :virtual_competition

    visit virtual_competitions_path

    expect(page).to have_content(competition.name)
  end
end
