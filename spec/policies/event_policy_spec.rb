describe EventPolicy do
  describe '#index?' do
    it 'allowed to guest user' do
      expect(EventPolicy.new(guest_user, Event).index?).to be_truthy
    end

    it 'allowed to registered user' do
      expect(EventPolicy.new(user, Event).index?).to be_truthy
    end
  end

  describe '#create?' do
    it 'not allowed to guest user' do
      expect(EventPolicy.new(guest_user, Event).create?).to be_falsey
    end

    it 'allowed to registered user' do
      expect(EventPolicy.new(user, Event).create?).to be_truthy
    end
  end

  describe '#show?' do
    permissions_map = [
      { status: 'draft',     visibility: 'public_event',   guest: false, registered: false, participant: false, organizer: true },
      { status: 'published', visibility: 'public_event',   guest: true,  registered: true,  participant: true,  organizer: true },
      { status: 'finished',  visibility: 'public_event',   guest: true,  registered: true,  participant: true,  organizer: true },
      { status: 'draft',     visibility: 'unlisted_event', guest: false, registered: false, participant: false, organizer: true },
      { status: 'published', visibility: 'unlisted_event', guest: true,  registered: true,  participant: true,  organizer: true },
      { status: 'finished',  visibility: 'unlisted_event', guest: true,  registered: true,  participant: true,  organizer: true },
      { status: 'draft',     visibility: 'private_event',  guest: false, registered: false, participant: false, organizer: true },
      { status: 'published', visibility: 'private_event',  guest: false, registered: false, participant: true,  organizer: true },
      { status: 'finished',  visibility: 'private_event',  guest: false, registered: false, participant: true,  organizer: true }
    ]

    permissions_map.each do |set|
      describe "#{set[:status]} #{set[:visibility]} event" do
        it "#{'not ' unless set[:guest]}allowed to guest user" do
          event = create(:event,
                         status: Event.statuses[set[:status]],
                         visibility: Event.visibilities[set[:visibility]])

          if set[:guest]
            expect(EventPolicy.new(guest_user, event).show?).to be_truthy
          else
            expect(EventPolicy.new(guest_user, event).show?).to be_falsey
          end
        end

        it "#{'not ' unless set[:registered]}allowed to registered user" do
          event = create(:event,
                         status: Event.statuses[set[:status]],
                         visibility: Event.visibilities[set[:visibility]])

          if set[:registered]
            expect(EventPolicy.new(user, event).show?).to be_truthy
          else
            expect(EventPolicy.new(user, event).show?).to be_falsey
          end
        end

        it "#{'not ' unless set[:participant]}allowed to participants" do
          event = create(:event,
                         status: Event.statuses[set[:status]],
                         visibility: Event.visibilities[set[:visibility]])

          # in case event finished we have to switch it to published to create competitor
          was_finished = event.finished?
          event.published! if was_finished

          create :event_competitor, event: event, profile: user.profile

          event.finished! if was_finished

          if set[:participant]
            expect(EventPolicy.new(user, event).show?).to be_truthy
          else
            expect(EventPolicy.new(user, event).show?).to be_falsey
          end
        end

        it 'allowed to organizer' do
          event = create(:event,
                         status: Event.statuses[set[:status]],
                         visibility: Event.visibilities[set[:visibility]],
                         responsible: user)

          if set[:organizer]
            expect(EventPolicy.new(user, event).show?).to be_truthy
          else
            expect(EventPolicy.new(user, event).show?).to be_falsey
          end
        end
      end
    end
  end

  describe '#update?' do
    it 'not allowed to guest user' do
      event = create(:event)

      expect(EventPolicy.new(guest_user, event).update?).to be_falsey
    end

    it 'not allowed to guest user' do
      event = create(:event)

      expect(EventPolicy.new(user, event).update?).to be_falsey
    end

    it 'allowed to responsible' do
      event = create(:event, responsible: user)

      expect(EventPolicy.new(user, event).update?).to be_truthy
    end

    it 'allowed to organizer' do
      event = create(:event)

      create :event_organizer, organizable: event, user: user

      expect(EventPolicy.new(user, event).update?).to be_truthy
    end
  end

  describe '#destroy?' do
    it 'not allowed to guest user' do
      event = create(:event)

      expect(EventPolicy.new(guest_user, event).destroy?).to be_falsey
    end

    it 'not allowed to guest user' do
      event = create(:event)

      expect(EventPolicy.new(user, event).destroy?).to be_falsey
    end

    it 'not allowed to organizer' do
      event = create(:event)

      create :event_organizer, organizable: event, user: user

      expect(EventPolicy.new(user, event).destroy?).to be_falsey
    end

    it 'allowed to responsible' do
      event = create :event, responsible: user

      expect(EventPolicy.new(user, event).destroy?).to be_truthy
    end
  end

  def user
    @user ||= create :user
  end

  def guest_user
    @guest_user ||= GuestUser.new({})
  end
end
