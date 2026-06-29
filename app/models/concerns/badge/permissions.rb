module Badge::Permissions
  extend ActiveSupport::Concern

  class_methods do
    def viewable?(user = Current.user) = user.admin?

    def creatable?(user = Current.user) = user.admin?
  end

  def editable?(user = Current.user) = user.admin?
end
