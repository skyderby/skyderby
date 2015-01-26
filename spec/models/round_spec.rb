require 'rails_helper'

describe Round, type: :model do
  let(:event) do
    event = Event.new
    event.save!(validate: false)
    event
  end

  it 'should require name' do
    round = Round.new(discipline: :time, event: event)
    expect(round).not_to be_valid
  end

  it 'should require discipline' do
    round = Round.new(name: 'Round 1', event: event)
    expect(round).not_to be_valid
  end

  it 'should require event' do
    round = Round.new(name: 'Round 1', discipline: :time)
    expect(round).not_to be_valid
  end
end
