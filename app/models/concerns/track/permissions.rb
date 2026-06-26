module Track::Permissions
  extend ActiveSupport::Concern

  class_methods do
    def accessible(user: Current.user)
      return public_track unless user&.profile
      return all if user.admin?

      where('profile_id = :profile OR visibility = 0', profile: user.profile)
    end

    def viewable(user: Current.user)
      directly_visible = where(visibility: %i[public_track unlisted_track])
      return directly_visible unless user&.profile
      return all if user.admin?

      owned = where(pilot: user.profile)
      directly_visible.or(owned)
    end
  end

  def viewable?(user = Current.user)
    public_track? || unlisted_track? || editable?(user)
  end

  def editable?(user = Current.user)
    user.admin? || owned_by?(user) || organizer_of_owning_event?(user)
  end

  alias deletable? editable?

  def downloadable?(user = Current.user)
    return true if user.admin?
    return false unless user.registered?

    recorded_by?(user)
  end

  def recorded_by?(user = Current.user)
    pilot.present? && pilot == user&.profile
  end

  private

  def owned_by?(user)
    if user.registered?
      owner == user
    else
      user.tracks.include?(id)
    end
  end

  def organizer_of_owning_event?(user)
    return false if belongs_to_user?
    return false unless user.registered?

    user.organizer_of_event?(owner)
  end
end
