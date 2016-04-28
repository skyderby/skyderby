require 'rails_helper'

RSpec.describe VirtualCompResult, type: :model do
  let(:virtual_competition) { create(:online_event) }
  let(:track) { create(:empty_track) }
  let(:pilot) { create(:pilot) }

  it 'validates uniqueness by virtual competition and track' do
    attrs = { track: track, 
              virtual_competition: virtual_competition,
              user_profile: pilot
            }
    record = VirtualCompResult.create!(attrs)
    expect(VirtualCompResult.create(attrs)).not_to be_valid
  end
end
