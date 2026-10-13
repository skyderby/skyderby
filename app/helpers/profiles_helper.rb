module ProfilesHelper
  def profile_name_by_id(id)
    Profile.find_by(id: id)&.name
  end

  def profile_select_option(profile)
    profile ? [profile.name, profile.id] : nil
  end

  def profile_avatar(profile, variant: :medium, css_class: nil)
    if profile.userpic.attached?
      image_tag profile.userpic_url(variant), class: css_class, alt: ''
    else
      tag.span profile_initials(profile.name), class: class_names(css_class, 'avatar-initials'), aria: { hidden: true }
    end
  end

  def profile_initials(name) = name.to_s.split.first(2).filter_map { |part| part[0] }.join.upcase
end
