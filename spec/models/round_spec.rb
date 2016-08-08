# == Schema Information
#
# Table name: rounds
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  event_id   :integer
#  created_at :datetime
#  updated_at :datetime
#  discipline :integer
#  profile_id :integer
#

require 'rails_helper'
require 'support/event_ongoing_validation'

describe Round, type: :model do
  let(:event) do
    event = Event.new
    event.save!(validate: false)
    event
  end

  it 'automatically set name as order within discipline' do
    round = Round.create!(discipline: 'time', event: event)
    expect(round.name).to eql '1'

    round = Round.create!(discipline: 'time', event: event)
    expect(round.name).to eql '2'

    round = Round.create!(discipline: 'speed', event: event)
    expect(round.name).to eql '1'

    round = Round.create!(discipline: 'speed', event: event)
    expect(round.name).to eql '2'
  end

  it 'should require discipline' do
    round = Round.new(name: 'Round 1', event: event)
    expect(round).not_to be_valid
  end

  it 'should require event' do
    round = Round.new(name: 'Round 1', discipline: :time)
    expect(round).not_to be_valid
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryGirl.create(:round) }
  end
end
