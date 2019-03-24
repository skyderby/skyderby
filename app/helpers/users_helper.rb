module UsersHelper
  def user_select_option(user)
    return unless user

    [user.name, user.id]
  end
end
