require 'rails_helper'

describe WingsuitHelper, type: :helper do
  it 'returns suit presentation' do
    suit = create :wingsuit
    expect(helper.suit_presentation(suit)).to eq(
      "<span class=\"text-warning\" data-toggle=\"tooltip\" title=\"#{suit.manufacturer.name}\"></span><span> #{suit.name}</span>"
    )
  end
end
