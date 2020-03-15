describe 'Filtering tracks list', js: true do
  it 'Filter by suit' do
    3.times do |x|
      suit = create :suit, name: "suit-#{x}"
      create :empty_track, suit: suit
    end
    visit tracks_path

    select2('suit-1', from: 'query_suit_id-container')

    expect(page).to have_css('#tracks-table > .tbody > .tr', count: 1)
    expect(page).to have_css('#tracks-table > .tbody > .tr > .td', text: 'suit-1')
  end
end
