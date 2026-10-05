module User::AccountDeletion
  extend ActiveSupport::Concern

  def delete_account!
    transaction do
      identities.each(&:revoke_apple_token)
      pay_subscriptions.active.each(&:cancel_now!)
      delete_own_tracks
      release_profile
      delete_authorizations
      release_references
      destroy!
    end
  end

  private

  def own_tracks = Track.where(owner_type: 'User', owner_id: id)

  # rubocop:disable Rails/SkipsModelValidations
  def delete_own_tracks
    removable = own_tracks.where.not(id: competition_tracks.select(:id))

    TerrainProfile.where(track_id: removable.select(:id)).update_all(track_id: nil)
    removable.find_each(&:destroy!)
    own_tracks.update_all(owner_type: nil, owner_id: nil)
    Track.where(user_id: id).update_all(user_id: nil)
  end

  def release_profile
    record = Profile.find_by(owner_type: 'User', owner_id: id)
    return unless record

    if profile_public_record?(record)
      record.userpic.purge_later if record.userpic.attached?
      record.update!(owner: nil)
    else
      record.destroy!
    end
    association(:profile).reset
  end

  def profile_public_record?(record)
    [
      record.tracks,
      record.performance_competition_participation,
      record.speed_skydiving_competition_participations,
      record.boogie_participations,
      record.tournament_participations,
      record.contribution_details,
      Tournament.where(profile_id: record.id),
      PerformanceCompetition.unscoped.where(profile_id: record.id)
    ].any?(&:exists?)
  end

  def delete_authorizations
    owner = { resource_owner_id: id, resource_owner_type: self.class.polymorphic_name }
    Doorkeeper::AccessToken.where(owner).delete_all
    Doorkeeper::AccessGrant.where(owner).delete_all
  end

  def release_references
    Organizer.where(user_id: id).delete_all
    responsible_sources.each { it.unscoped.where(responsible_id: id).update_all(responsible_id: nil) }
    GiftedSubscription.where(granted_by_id: id).update_all(granted_by_id: nil)
    TerrainProfile::Share.where(user_id: id).delete_all
    Place::Submission.where(user_id: id).delete_all
    PerformanceCompetition::Competitor.unscoped.where(user_id: id).update_all(user_id: nil)
  end
  # rubocop:enable Rails/SkipsModelValidations

  def competition_tracks
    competition_track_sources.map { |source| own_tracks.where(id: source.unscoped.select(:track_id)) }.reduce(:or)
  end

  def competition_track_sources
    [PerformanceCompetition::Result, SpeedSkydivingCompetition::Result, Tournament::Match::Slot, QualificationJump]
  end

  def responsible_sources
    [PerformanceCompetition, SpeedSkydivingCompetition, PerformanceCompetitionSeries,
     SpeedSkydivingCompetitionSeries, Tournament]
  end
end
