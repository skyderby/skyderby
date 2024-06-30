require 'test_helper'

class Tournament::Match::SlotTest < ActiveSupport::TestCase
  setup do
    @attributes = {
      competitor: tournament_competitors(:race_competitor),
      match: tournament_matches(:match_1)
    }
  end

  test 'replace NaN in result with 0.0' do
    record = Tournament::Match::Slot.create(@attributes.merge(result: BigDecimal::NAN))

    assert_equal 0, record.result
  end

  test 'replace Infinity in result with 0.0' do
    record = Tournament::Match::Slot.create(@attributes.merge(result: BigDecimal('Infinity')))

    assert_equal 0, record.result
  end

  test 'correctly handles null in result' do
    record = Tournament::Match::Slot.create(@attributes.merge(result: nil))

    assert_nil record.result
  end
end
