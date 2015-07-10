require 'rails_helper'

describe WingsuitsHelper, type: :helper do
  it 'returns suit presentation' do
    suit = create :wingsuit
    expect(helper.suit_presentation(suit)).to eq(
      "<span class=\"text-warning\" data-toggle=\"tooltip\" title=\"#{suit.manufacturer.name}\">#{suit.manufacturer.code}</span><span> #{suit.name}</span>"
    )
  end
end
