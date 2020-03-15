describe VirtualCompetitions::TitlePresenter do
  it 'with group' do
    group = create :virtual_competition_group, name: 'WTF'
    competition = create :virtual_competition, name: 'Gridset race', group: group

    title = VirtualCompetitions::TitlePresenter.call(competition)
    expect(title).to eq('WTF - Gridset race')
  end
end
