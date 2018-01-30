describe PlacesHelper do
  it 'returns place presentation with country code' do
    country = create :country, name: 'Norway', code: 'NOR'
    place = create :place, name: 'Gridset', country: country

    expect(helper.place_presentation(place)).to eq(
      '<span>Gridset</span> (<span class="text-warning" data-toggle="tooltip" title="Norway">NOR</span>)'
    )
  end
end
