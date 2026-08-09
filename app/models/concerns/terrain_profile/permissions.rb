module TerrainProfile::Permissions
  extend ActiveSupport::Concern

  class_methods do
    def creatable?(user = Current.user) = user&.registered? || false

    def shareable_by?(user = Current.user)
      return false unless user&.registered?

      user.admin? || user.role?(:edit_places)
    end

    def viewable(user = Current.user)
      return published unless user&.registered?
      return all if user.admin?
      return published.or(owned_by(user)).or(shared) if shareable_by?(user)

      published.or(owned_by(user))
    end
  end

  def viewable?(user = Current.user)
    published? || editable?(user)
  end

  def editable?(user = Current.user)
    return false unless user&.registered?
    return true if owned_by?(user) || user.admin?

    (shared? || published?) && user.role?(:edit_places)
  end

  alias deletable? editable?

  def shared? = user_id.nil?

  def owned_by?(user = Current.user)
    user_id.present? && user_id == user&.id
  end
end
