require 'test_helper'

class EventPolicyTest < ActiveSupport::TestCase
  setup do
    @user ||= create :user
    @guest_user ||= GuestUser.new({})
  end

  test '#index?' do
    assert_predicate EventPolicy.new(@guest_user, Event), :index?
    assert_predicate EventPolicy.new(@user, Event), :index?
  end

  test '#create?' do
    assert_not_predicate EventPolicy.new(@guest_user, Event), :create?
    assert_predicate EventPolicy.new(@user, Event), :create?
  end

  test '#show?' do
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
        assert_predicate EventPolicy.new(@guest_user, event), :show?,
                         "Event #{status}/#{visibility} should be visible to guest user"
      else
        assert_not_predicate EventPolicy.new(@guest_user, event), :show?,
                             "Event #{status}/#{visibility} should NOT be visible to guest user"
      end

      if params[:registered]
        assert_predicate EventPolicy.new(@user, event), :show?,
                         "Event #{status}/#{visibility} should be visible to registered user"
      else
        assert_not_predicate EventPolicy.new(@user, event), :show?,
                             "Event #{status}/#{visibility} should NOT be visible to registered user"
      end

      user = create :user
      was_finished = event.finished?
      event.published! if was_finished
      section = event.sections.create(name: 'Open')
      event.competitors.create!(profile: user.profile, suit: suits(:apache), section:)
      event.finished! if was_finished

      if params[:participant]
        assert_predicate EventPolicy.new(user, event), :show?,
                         "Event #{status}/#{visibility} should be visible to participant"
      else
        assert_not_predicate EventPolicy.new(user, event), :show?,
                             "Event #{status}/#{visibility} should NOT be visible to participant"
      end

      user = create :user
      event = create(:event, status:, visibility:, responsible: user)

      if params[:organizer]
        assert_predicate EventPolicy.new(user, event), :show?,
                         "Event #{status}/#{visibility} should be visible to organizer"
      else
        assert_predicate EventPolicy.new(user, event), :show?,
                         "Event #{status}/#{visibility} should NOT be visible to organizer"
      end
    end
  end

  test '#update?' do
    event = create(:event)

    assert_not_predicate EventPolicy.new(@guest_user, event), :update?
    assert_not_predicate EventPolicy.new(@user, event), :update?

    event = create(:event, responsible: @user)
    assert_predicate EventPolicy.new(@user, event), :update?

    event = create(:event)
    create(:event_organizer, organizable: event, user: @user)
    assert_predicate EventPolicy.new(@user, event), :update?
  end

  test '#destroy?' do
    event = create(:event)

    assert_not_predicate EventPolicy.new(@guest_user, event), :destroy?
    assert_not_predicate EventPolicy.new(@user, event), :destroy?

    event = create(:event)
    create :event_organizer, organizable: event, user: @user
    assert_not_predicate EventPolicy.new(@user, event), :destroy?

    event = create :event, responsible: @user
    assert_predicate EventPolicy.new(@user, event), :destroy?
  end
end
