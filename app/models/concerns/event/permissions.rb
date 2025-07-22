module Event::Permissions
  extend ActiveSupport::Concern

  class_methods do
    def creatable?(user = Current.user) = user.registered?

    def listable(user = Current.user)
      not_draft
        .public_event
        .or(where(responsible: user))
        .or(where(id: user.participant_of_events))
    end
  end

  def viewable?(user = Current.user)
    return true if editable?(user)
    return false if draft?
    return true if public_event? || unlisted_event?

    user&.profile.present? && competitors.exists?(profile: user.profile)
  end

  def editable?(user = Current.user)
    @editable ||= user.admin? || user == responsible || organizers.exists?(user:)
  end

  def deletable?(user = Current.user) = user.admin? || user == responsible
end
