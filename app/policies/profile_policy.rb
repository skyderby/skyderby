class ProfilePolicy < ApplicationPolicy
  def index? = true

  def update?
    admin? || owner? ||
      (record.belongs_to_event? && organizer_of_event?)
  end

  def masquerade?
    admin?
  end

  def merge?
    admin?
  end

  def subscription?
    admin? && record.belongs_to_user?
  end

  def grant_subscription?
    admin? && record.belongs_to_user?
  end

  def gift_subscription?
    user && record.belongs_to_user? && record.owner != user && !record.owner.subscription_active?
  end

  def owner?
    user && record.owner == user
  end

  def organizer_of_event?
    user.organizer_of_event?(record.owner)
  end
end
