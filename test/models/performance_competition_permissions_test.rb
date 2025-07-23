require 'test_helper'

class PerformanceCompetitionPermissionsTest < ActiveSupport::TestCase
  setup do
    @user ||= create :user
    @guest_user ||= GuestUser.new({})
  end

  test '.creatable? for guest user' do
    assert_not PerformanceCompetition.creatable?(@guest_user)
  end

  test '.creatable? for registered user' do
    assert PerformanceCompetition.creatable?(@user)
  end

  test '#viewable?' do
    # rubocop:disable Layout/LineLength
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
    # rubocop:enable Layout/LineLength

    permissions_map.each do |params|
      visibility = params[:visibility]
      status = params[:status]
      event = create(:event, status:, visibility:, name: "#{status}/#{visibility}")

      if params[:guest]
        assert event.viewable?(@guest_user),
               "Event #{status}/#{visibility} should be visible to guest user"
      else
        assert_not event.viewable?(@guest_user),
                   "Event #{status}/#{visibility} should NOT be visible to guest user"
      end

      if params[:registered]
        assert event.viewable?(@user),
               "Event #{status}/#{visibility} should be visible to registered user"
      else
        assert_not event.viewable?(@user),
                   "Event #{status}/#{visibility} should NOT be visible to registered user"
      end

      user = create :user
      was_finished = event.finished?
      event.published! if was_finished
      category = event.categories.create(name: 'Open')
      event.competitors.create!(profile: user.profile, suit: suits(:apache), category:)
      event.finished! if was_finished

      if params[:participant]
        assert event.viewable?(user),
               "Event #{status}/#{visibility} should be visible to participant"
      else
        assert_not event.viewable?(user),
                   "Event #{status}/#{visibility} should NOT be visible to participant"
      end

      user = create :user
      event = create(:event, status:, visibility:, responsible: user)

      if params[:organizer]
        assert event.viewable?(user),
               "Event #{status}/#{visibility} should be visible to organizer"
      else
        assert event.viewable?(user),
               "Event #{status}/#{visibility} should NOT be visible to organizer"
      end
    end
  end

  test '#editable?' do
    event = create(:event)

    assert_not event.editable?(@guest_user)
    assert_not event.editable?(@user)

    event = create(:event, responsible: @user)
    assert event.editable?(@user)

    event = create(:event)
    create(:event_organizer, organizable: event, user: @user)
    assert event.editable?(@user)
  end

  test '#deletable?' do
    event = create(:event)

    assert_not event.deletable?(@guest_user)
    assert_not event.deletable?(@user)

    event = create(:event)
    create :event_organizer, organizable: event, user: @user
    assert_not event.deletable?(@user)

    event = create :event, responsible: @user
    assert event.deletable?(@user)
  end

  test '.listable for guest user' do
    visible_events = [
      { status: :published, visibility: :public_event },
      { status: :published, visibility: :public_event }
    ]

    visible_events.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      event = create(:event, status:, visibility:)
      current_user = GuestUser.new({})

      assert_includes PerformanceCompetition.listable(current_user), event
    end

    hidden_events = [
      { status: :draft, visibility: :public_event },
      { status: :published, visibility: :unlisted_event },
      { status: :published, visibility: :private_event }
    ]

    hidden_events.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      event = create(:event, status:, visibility:)
      current_user = GuestUser.new({})

      assert_not_includes PerformanceCompetition.listable(current_user), event
    end
  end

  test '.listable for responsible user can see their own events' do
    visible_events = [
      { status: :draft, visibility: :public_event },
      { status: :draft, visibility: :unlisted_event },
      { status: :draft, visibility: :private_event },
      { status: :published, visibility: :public_event },
      { status: :published, visibility: :unlisted_event },
      { status: :published, visibility: :private_event },
      { status: :finished, visibility: :public_event },
      { status: :finished, visibility: :unlisted_event },
      { status: :finished, visibility: :private_event }
    ]

    current_user = create(:user)

    visible_events.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      event = create(:event,
                     responsible: current_user,
                     status: Event.statuses[status],
                     visibility: Event.visibilities[visibility])

      assert_includes PerformanceCompetition.listable(current_user), event
    end
  end
end
