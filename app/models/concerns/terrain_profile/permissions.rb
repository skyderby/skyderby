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

      scope = published.or(owned_by(user)).or(shared_with(user))
      shareable_by?(user) ? scope.or(shared) : scope
    end
  end

  def viewable?(user = Current.user)
    published? || editable?(user) || shared_with?(user)
  end

  def editable?(user = Current.user)
    return false unless user&.registered?
    return true if owned_by?(user) || user.admin?

    (shared? || published?) && user.role?(:edit_places)
  end

  alias deletable? editable?

  def shareable_with_users?(user = Current.user) = owned_by?(user)

  def shared_with?(user = Current.user)
    return false unless user&.registered?

    shares.any? { |share| share.user_id == user.id }
  end

  def removable_by?(user = Current.user)
    deletable?(user) || shared_with?(user)
  end

  def shared? = user_id.nil?

  def owned_by?(user = Current.user)
    user_id.present? && user_id == user&.id
  end
end
