describe 'Filtering tracks list', js: true, skip: true do
  it 'Filter by suit' do
    3.times do |x|
      suit = create :suit, name: "suit-#{x}"
      create :empty_track, suit: suit
    end

    visit tracks_path

    within('[aria-label="Search field"]') do
      find('[aria-label="Select filter criteria"]').send_keys :down
      find('span', text: 'Suit').click
      first('span', text: 'suit-1').click
    end

    expect(page).to have_css('[aria-label="Tracks list"] > div', count: 2)
    expect(page).to have_css('[aria-label="Tracks list"] span', text: 'suit-1')
  end
end
