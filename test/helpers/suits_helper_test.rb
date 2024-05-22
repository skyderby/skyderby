describe SuitsHelper, type: :helper do
  it 'returns suit presentation' do
    suit = create :suit
    expect(helper.suit_presentation(suit)).to eq([
      "<span class=\"text-warning\" data-toggle=\"tooltip\" title=\"#{suit.manufacturer.name}\">",
      suit.manufacturer.code,
      '</span>',
      "<span> #{suit.name}</span>"
    ].join)
  end
end
