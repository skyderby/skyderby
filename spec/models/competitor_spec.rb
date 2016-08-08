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

require 'rails_helper'
require 'support/event_ongoing_validation'

RSpec.describe Competitor, type: :model do
  it 'can create profile if not set' do
    wingsuit     = create :wingsuit
    section      = create :section
    profile_name = 'Mario McTester'

    competitor = Competitor.create(
      profile_attributes: {name: profile_name},
      profile_mode: :new,
      wingsuit: wingsuit,
      event: section.event,
      section: section
    )

    expect(competitor.profile.name).to eq(profile_name)
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryGirl.create(:competitor) }
  end
end
