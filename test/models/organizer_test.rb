require 'test_helper'

class OrganizerTest < ActiveSupport::TestCase
  setup do
    @event = events(:nationals)
    @user = users(:regular_user)
  end

  test 'can not be created for finished event' do
    @event.finished!
    assert_raises(ActiveRecord::RecordInvalid) do
      @event.organizers.create!(user: @user)
    end
  end

  test 'can not be destroyed for finished event' do
    organizer = @event.organizers.create!(user: @user)
    @event.finished!

    assert_raises(ActiveRecord::RecordNotDestroyed) do
      organizer.destroy!
    end
  end

  test 'requires event' do
    user = create :user
    assert_not Organizer.new(user: user).valid?
  end

  test 'requires user' do
    event = create :event
    assert_not Organizer.new(organizable: event).valid?
  end
end
