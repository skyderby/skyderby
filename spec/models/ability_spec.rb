require 'spec_helper'
require 'cancan/matchers'

describe 'User' do
  describe 'abilities' do
    subject(:ability) { Ability.new(user) }
    let(:user) { nil }
    let(:event_track) do
      event_track = EventTrack.new
      allow(event_track).to receive(:calc_result)
      event_track.save!(validate: false)
      event_track
    end

    context 'when is not signed in' do
      context 'Can read all public and unlisted tracks' do
        it { should be_able_to(:read, Track.new(visibility: :public_track)) }
        it { should be_able_to(:read, Track.new(visibility: :unlisted_track)) }
        it { should_not be_able_to(:read, Track.new(visibility: :private_track)) }
      end

      it 'Can create track' do
        should be_able_to(:create, Track)
      end

      context 'Can edit and delete while not viewed' do
        it do
          should be_able_to(:update, Track.new(user: nil,
                                               lastviewed_at: nil))
        end
        it do
          should be_able_to(:destroy, Track.new(user: nil,
                                                lastviewed_at: nil))
        end
      end

      context 'Cannot edit or delete if viewed or used in event' do
        it do
          should_not be_able_to(:update, Track.new(user: nil,
                                                   lastviewed_at: Time.now))
        end
        it do
          should_not be_able_to(:destroy, Track.new(user: nil,
                                                    lastviewed_at: Time.now))
        end
        it do
          should_not be_able_to(:destroy, Track.new(event_track: event_track))
        end
      end
    end

    context 'when is a regular user' do
      let(:user) { FactoryGirl.create(:user) }

      it do
        should be_able_to(:read, Track.new(user: nil,
                                           visibility: :public_track))
      end

      it do
        should be_able_to(:read, Track.new(user: nil,
                                           visibility: :unlisted_track))
      end

      it do
        should_not be_able_to(:read, Track.new(user: nil,
                                               visibility: :private_track))
      end

      it do
        should be_able_to(:read, Track.new(user: user,
                                           visibility: :private_track))
      end
    end

    context 'when is an admin' do
    end
  end
end
