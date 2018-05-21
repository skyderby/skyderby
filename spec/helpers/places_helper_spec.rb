describe PlacesHelper do
  it 'returns place presentation with country code' do
    place = places(:hellesylt)

    expect(helper.place_presentation(place)).to eq(
      '<span>Hellesylt</span> (<span class="text-warning" data-toggle="tooltip" title="Norway">NOR</span>)'
    )
  end
end
