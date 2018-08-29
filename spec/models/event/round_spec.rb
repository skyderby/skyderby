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

require 'support/event_ongoing_validation'

describe Event::Round, type: :model do
  let(:event) do
    event = Event.new
    event.save!(validate: false)
    event
  end

  it 'automatically set name as order within discipline' do
    round = event.rounds.create!(discipline: 'time')
    expect(round.number).to eql 1

    round = event.rounds.create!(discipline: 'time')
    expect(round.number).to eql 2

    round = event.rounds.create!(discipline: 'speed')
    expect(round.number).to eql 1

    round = event.rounds.create!(discipline: 'speed')
    expect(round.number).to eql 2
  end

  it 'should require discipline' do
    round = event.rounds.new(number: 1)
    expect(round).not_to be_valid
  end

  it 'should require event' do
    round = Event::Round.new(number: 1, discipline: :time)
    expect(round).not_to be_valid
  end

  it '.find_by_name' do
    event = events(:published_public)
    expect(event.rounds.find_by_name('Distance-1')).to eq(event_rounds(:distance_round_1))
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { create :event_round }
  end
end
