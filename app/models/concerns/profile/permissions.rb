module Profile::Permissions
  extend ActiveSupport::Concern

  def editable?(user = Current.user)
    user.admin? || owned_by?(user) || organizer_of_owning_event?(user)
  end

  def deletable?(user = Current.user) = user.admin?

  def masqueradable?(user = Current.user) = user.admin?

  def mergeable?(user = Current.user) = user.admin?

  def manageable_subscription?(user = Current.user)
    user.admin? && belongs_to_user?
  end

  def giftable_subscription?(user = Current.user)
    belongs_to_user? && owner != user && !owner&.subscription_active?
  end

  private

  def owned_by?(user) = owner == user

  def organizer_of_owning_event?(user)
    belongs_to_event? && user.organizer_of_event?(owner)
  end
end
