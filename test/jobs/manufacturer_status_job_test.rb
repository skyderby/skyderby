require 'test_helper'

class ManufacturerStatusJobTest < ActiveJob::TestCase
  test 'updates status for manufacturers' do
    active_manufacturer = Manufacturer.create!(name: 'M1', code: 'M1')
    inactive_manufacturer = Manufacturer.create!(name: 'M2', code: 'M2')

    suit = active_manufacturer.suits.create(name: 'S1', kind: :wingsuit)

    create_list(:empty_track, 10, suit:)

    ManufacturerStatusJob.perform_now

    assert active_manufacturer.reload.active
    assert_not inactive_manufacturer.reload.active
  end
end
