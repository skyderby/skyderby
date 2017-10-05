# == Schema Information
#
# Table name: competitors
#
#  id          :integer          not null, primary key
#  event_id    :integer
#  user_id     :integer
#  created_at  :datetime
#  updated_at  :datetime
#  wingsuit_id :integer
#  name        :string(510)
#  section_id  :integer
#  profile_id  :integer
#

require 'support/event_ongoing_validation'

describe Competitor, type: :model do
  it 'can create profile if not set' do
    suit         = create :suit
    section      = create :section
    profile_name = 'Mario McTester'

    competitor = Competitor.create(
      profile_attributes: { name: profile_name },
      profile_mode: :create,
      suit: suit,
      event: section.event,
      section: section
    )

    expect(competitor.profile.name).to eq(profile_name)
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryGirl.create(:competitor) }
  end
end
