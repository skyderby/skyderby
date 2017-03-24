module ProfilesHelper
  def profile_name_by_id(id)
    Profile.find_by(id: id)&.name
  end
end
