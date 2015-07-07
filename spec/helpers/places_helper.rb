require 'rails_helper'

describe PlacesHelper, type: :helper do
  it 'returns place presentation with country code' do
    place = create :place, :gridset
    expect(helper.place_presentation(place)).to eq(
      "<span>#{place.name}</span> (<span class=\"text-warning\" data-toggle=\"tooltip\" title=\"#{place.country.name}\">#{place.country.code.upcase}</span>)"
    )
  end
end
