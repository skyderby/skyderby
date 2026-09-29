module CompetitionSeriesPermissions
  def viewable?(user = Current.user)
    return true if editable?(user)
    return false if draft?
    return true unless private_event?

    user.profile.present? && competitions.any? { |competition| competition.competitors.exists?(profile: user.profile) }
  end

  def editable?(user = Current.user) = user.admin? || user == responsible
end
