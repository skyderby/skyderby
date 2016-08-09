# == Schema Information
#
# Table name: virtual_comp_results
#
#  id                     :integer          not null, primary key
#  virtual_competition_id :integer
#  track_id               :integer
#  result                 :float            default(0.0)
#  created_at             :datetime
#  updated_at             :datetime
#  profile_id             :integer
#  highest_speed          :float            default(0.0)
#  highest_gr             :float            default(0.0)
#

require 'rails_helper'

RSpec.describe VirtualCompResult, type: :model do
  let(:virtual_competition) { create(:online_event) }
  let(:track) { create(:empty_track) }
  let(:pilot) { create(:pilot) }

  it 'validates uniqueness by virtual competition and track' do
    attrs = { track: track, 
              virtual_competition: virtual_competition,
              profile: pilot
            }
    record = VirtualCompResult.create!(attrs)
    expect(VirtualCompResult.create(attrs)).not_to be_valid
  end
end
