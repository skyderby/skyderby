require 'test_helper'

class User::AccountDeletionTest < ActiveSupport::TestCase
  setup do
    @user = users(:regular_user)
    @profile = profiles(:regular_user)
    @competition_track = tracks(:hellesylt)
    @competition_track.update_columns(owner_type: 'User', owner_id: @user.id)
    @private_track = Track.create!(owner: @user, pilot: @profile, name: 'Private', visibility: :private_track,
                                   kind: :skydive)
    event_competitors(:alex).update_column(:profile_id, @profile.id)
  end

  test 'keeps competition data as an anonymous athlete record' do
    @profile.userpic.attach(io: file_fixture('profile_userpic.png').open, filename: 'userpic.png')
    @user.identities.create!(provider: 'apple', uid: 'apple-1', email: @user.email)
    @user.setting.save!
    @user.free_pro_views.create!(track: @private_track)

    @user.delete_account!

    assert_not User.exists?(@user.id)
    assert_not Track.exists?(@private_track.id)
    assert_nil @competition_track.reload.owner
    assert_equal @profile, @competition_track.pilot

    @profile.reload
    assert_nil @profile.owner
    assert_equal 'Regular user', @profile.name
    assert_not @profile.userpic.attached?

    assert_empty User::Identity.where(user_id: @user.id)
    assert_empty User::Setting.where(user_id: @user.id)
    assert_empty FreeProView.where(user_id: @user.id)
    assert_empty Doorkeeper::AccessToken.where(resource_owner_id: @user.id)
  end

  test 'keeps profile with competitor records even without tracks' do
    @competition_track.update_columns(profile_id: profiles(:john).id)

    @user.delete_account!

    assert_nil @profile.reload.owner
  end

  test 'deletes everything for a user with nothing public' do
    user = User.create!(email: 'empty@example.com', password: 'changeme', profile_attributes: { name: 'Empty' })
    profile = user.profile

    user.delete_account!

    assert_not User.exists?(user.id)
    assert_not Profile.exists?(profile.id)
  end

  test 'deletes a profile whose only tracks were private' do
    user = User.create!(email: 'solo@example.com', password: 'changeme', profile_attributes: { name: 'Solo' })
    profile = user.profile
    track = Track.create!(owner: user, pilot: profile, name: 'Solo', kind: :base)

    user.delete_account!

    assert_not Track.exists?(track.id)
    assert_not Profile.exists?(profile.id)
  end

  test 'releases organizer and responsible records' do
    user = users(:event_responsible)
    event = events(:nationals)
    event.organizers.create!(user: users(:regular_user))
    Organizer.create!(organizable: event, user:)

    user.delete_account!

    assert_nil event.reload.responsible_id
    assert_empty Organizer.where(user_id: user.id)
    assert_equal 1, event.organizers.count
  end

  test 'revokes Apple tokens' do
    @user.identities.create!(provider: 'apple', uid: 'apple-1', apple_refresh_token: 'refresh-1')
    revoked = []

    User::Identity::AppleAuthorization.stub(:revoke, ->(token) { revoked << token }) do
      @user.delete_account!
    end

    assert_equal ['refresh-1'], revoked
  end

  test 'cancels active subscriptions' do
    customer = Pay::Customer.create!(owner: @user, processor: 'fake_processor', processor_id: 'cus_1',
                                     type: 'Pay::FakeProcessor::Customer', default: true)
    subscription = Pay::FakeProcessor::Subscription.create!(customer:, name: 'default', processor_id: 'sub_1',
                                                            processor_plan: 'pro', status: 'active', quantity: 1)

    @user.delete_account!

    assert_not subscription.reload.active?
  end

  test 'rolls back when something fails' do
    @user.stub(:destroy!, -> { raise ActiveRecord::RecordNotDestroyed, 'boom' }) do
      assert_raises(ActiveRecord::RecordNotDestroyed) { @user.delete_account! }
    end

    assert User.exists?(@user.id)
    assert Track.exists?(@private_track.id)
    assert_equal @user, @profile.reload.owner
  end
end
