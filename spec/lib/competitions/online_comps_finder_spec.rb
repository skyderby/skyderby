require 'spec_helper'
require 'competitions/online_comps_finder'

describe OnlineCompsFinder do
  before :all do
    @place = Place.create(name: 'Gridset')
    @worldwide_comp = VirtualCompetition.create(
      name: 'Comp',
      period_from: Time.parse('2015/01/01'),
      period_to: Time.parse('2015/12/31')
    )
    @worldwide_comp.skydive!
    @worldwide_comp.wingsuit!

    @place_comp = VirtualCompetition.create(
      name: 'Comp',
      place: @place,
      period_from: Time.parse('2015/01/01'),
      period_to: Time.parse('2015/12/31')
    )
    @place_comp.skydive!
    @place_comp.wingsuit!

    @last_year_comp = VirtualCompetition.create(
      name: 'Comp',
      place: @place,
      period_from: Time.parse('2014/01/01'),
      period_to: Time.parse('2014/12/31')
    )
    @last_year_comp.skydive!
    @last_year_comp.wingsuit!
  end

  it 'should find only worldwide competition' do
    competitions = OnlineCompsFinder.find({
      activity: :skydive,
      suit_kind: :wingsuit,
      period: Time.parse('2015/02/02')
    })

    expect(
      competitions.include?(@worldwide_comp) &&
        competitions.count == 1
    ).to be_truthy
  end

  it 'should find worldwide and place specific competitions' do
    competitions = OnlineCompsFinder.find({
      activity: :skydive,
      suit_kind: :wingsuit,
      period: Time.parse('2015/02/02'),
      place_id: @place.id
    })

    expect(
      competitions.include?(@worldwide_comp) &&
        competitions.include?(@place_comp) &&
        competitions.count == 2
    ).to be_truthy
  end
end 
