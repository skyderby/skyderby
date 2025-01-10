describe ManufacturerStatusJob do
  it 'updates status for manufacturers', :aggregate_failures do
    active_manufacturer = Manufacturer.create!(name: 'M1', code: 'M1')
    inactive_manufacturer = Manufacturer.create!(name: 'M2', code: 'M2')

    suit = active_manufacturer.suits.create(name: 'S1', kind: :wingsuit)

    create_list(:empty_track, 10, suit: suit)

    described_class.perform_now

    expect(active_manufacturer.reload.active).to be_truthy
    expect(inactive_manufacturer.reload.active).to be_falsey
  end
end
