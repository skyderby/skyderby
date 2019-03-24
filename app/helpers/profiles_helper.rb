module ProfilesHelper
  def profile_name_by_id(id)
    Profile.find_by(id: id)&.name
  end

  def profile_select_option(profile)
    profile ? [profile.name, profile.id] : nil
  end
end
