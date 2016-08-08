require 'spec_helper'

describe EventsFinder do
  let(:user1) { create :user }
  let(:user2) { create :user }

  let(:comp1) { event = create :event, :draft }
  let(:comp2) { event = create :event, :draft }
  let(:comp3) { create :event, :published }

  context 'when authorized, its own event and public event' do
    before { comp1.update(profile_id: user1.profile.id) }

    subject { EventsFinder.new.execute(user1) }

    it { is_expected.to include(comp1) }
    it { is_expected.to include(comp3) }
    it { is_expected.not_to include(comp2) }
  end

  context 'when authorized, its organized and public event' do
    before { comp2.event_organizers << EventOrganizer.new(profile: user2.profile) }

    subject { EventsFinder.new.execute(user2) }

    it { is_expected.to include(comp2) }
    it { is_expected.to include(comp3) }
    it { is_expected.not_to include(comp1) }
  end

  context 'when not authorized' do
    subject { EventsFinder.new.execute(nil) }

    it { is_expected.to include(comp3) }
    it { is_expected.not_to include(comp1) }
    it { is_expected.not_to include(comp2) }
  end
end
