require 'test_helper'

class Sync::TombstoneTest < ActiveSupport::TestCase
  test 'destroying a synced record writes a tombstone' do
    country = Country.create!(name: 'Atlantis', code: 'ATL')

    assert_difference -> { Sync::Tombstone.for_resource('countries').where(record_id: country.id).count } do
      country.destroy!
    end
  end

  test 'destroying a place writes tombstones for it and its finish lines' do
    place = Place.create!(name: 'Kjerag', kind: :base, country: countries(:norway), latitude: 59.02, longitude: 6.58)
    finish_line = place.finish_lines.create!(name: 'Line', start_latitude: 59.02, start_longitude: 6.58,
                                             end_latitude: 59.03, end_longitude: 6.59)

    place.destroy!

    assert Sync::Tombstone.exists?(resource: 'places', record_id: place.id)
    assert Sync::Tombstone.exists?(resource: 'place_finish_lines', record_id: finish_line.id)
  end

  test 'failed destroy does not write a tombstone' do
    assert_no_difference -> { Sync::Tombstone.count } do
      assert_not countries(:norway).destroy
    end
  end

  test 'prune removes tombstones older than retention' do
    old = Sync::Tombstone.create!(resource: 'suits', record_id: 1,
                                  deleted_at: (Sync::TOMBSTONE_RETENTION + 1.day).ago)
    recent = Sync::Tombstone.create!(resource: 'suits', record_id: 2, deleted_at: 1.day.ago)

    Sync::Tombstone.prune

    assert_not Sync::Tombstone.exists?(old.id)
    assert Sync::Tombstone.exists?(recent.id)
  end
end
