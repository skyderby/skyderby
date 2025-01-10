require 'test_helper'

class VirtualCompetition::ResultTest < ActiveSupport::TestCase
  setup do
    @valid_attributes = {
      track: create(:empty_track),
      virtual_competition: virtual_competitions(:base_race)
    }
  end

  test 'validates uniqueness by virtual competition and track' do
    VirtualCompetition::Result.create!(@valid_attributes)
    @duplicated_record = VirtualCompetition::Result.new(@valid_attributes)

    assert_not @duplicated_record.valid?
  end
end
