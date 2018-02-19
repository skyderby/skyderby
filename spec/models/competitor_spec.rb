# == Schema Information
#
# Table name: competitors
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#  suit_id    :integer
#  name       :string(510)
#  section_id :integer
#  profile_id :integer
#

require 'support/event_ongoing_validation'

describe Competitor, type: :model do
  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryBot.create(:competitor) }
  end
end
