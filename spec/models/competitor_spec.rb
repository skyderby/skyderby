# == Schema Information
#
# Table name: competitors
#
#  id              :integer          not null, primary key
#  event_id        :integer
#  user_id         :integer
#  created_at      :datetime
#  updated_at      :datetime
#  wingsuit_id     :integer
#  name            :string(255)
#  section_id      :integer
#  user_profile_id :integer
#

require 'rails_helper'

RSpec.describe Competitor, type: :model do
  it 'can create profile if not set' do
    wingsuit     = create :wingsuit
    section      = create :section
    profile_name = 'Mario McTester'

    competitor = Competitor.create(
      profile_name: profile_name,
      wingsuit: wingsuit,
      event: section.event,
      section: section
    )

    expect(competitor.user_profile.name).to eq(profile_name)
  end
end
