require 'rails_helper'

describe EventList, type: :model do
  describe '#visible_to' do
    it 'shows public competitions to non-participants' do
      events = create_events
      user = create :user

      event_array = EventList.visible_to(user).map(&:event)
      expect(event_array).to match_array [events[:public_finished]]
    end

    it 'shows all events where organizer' do
      events = create_events
      user = create :user

      create :event_organizer, profile: user.profile, event: events[:public_draft]

      event_array = EventList.visible_to(user).map(&:event)
      expect(event_array).to match_array [events[:public_draft], events[:public_finished]]
    end

    it 'shows events where user compete' do
      events = create_events
      user = create :user

      create :competitor, profile: user.profile, event: events[:public_draft]

      event_array = EventList.visible_to(user).map(&:event)
      expect(event_array).to match_array [events[:public_draft], events[:public_finished]]
    end
  end

  def create_events
    {
      public_draft:      create(:event, status: Event.statuses[:draft],    visibility: Event.visibilities[:public_event]),
      public_finished:   create(:event, status: Event.statuses[:finished], visibility: Event.visibilities[:public_event]),
      unlisted_finished: create(:event, status: Event.statuses[:finished], visibility: Event.visibilities[:unlisted_event]),
      private_finished:  create(:event, status: Event.statuses[:finished], visibility: Event.visibilities[:private_event])
    }
  end
end
