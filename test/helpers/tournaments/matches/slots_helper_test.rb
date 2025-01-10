describe Tournaments::Matches::SlotsHelper do
  it '#match_slot_presentation' do
    slot = tournament_match_slots(:slot_1)
    expect(helper.match_slot_presentation(slot)).to include('John | Round - 1')
  end
end
