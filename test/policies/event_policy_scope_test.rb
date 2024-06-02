require 'test_helper'

class EventPolicyTest < ActiveSupport::TestCase
  test 'guest user events visibility' do
    visible_events = [
      { status: :published, visibility: :public_event },
      { status: :published, visibility: :public_event }
    ]

    visible_events.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      event = create(:event, status:, visibility:)
      current_user = GuestUser.new({})

      assert_includes EventPolicy::Scope.new(current_user, Event).resolve, event
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

      assert_not_includes EventPolicy::Scope.new(current_user, Event).resolve, event
    end
  end

  test 'responsible can see his own events in any status' do
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

      assert_includes EventPolicy::Scope.new(current_user, Event).resolve, event
    end
  end
end
