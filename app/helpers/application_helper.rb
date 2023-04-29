module ApplicationHelper
  def page_title(title)
    base_title = I18n.t 'static_pages.index.title'
    title.present? ? "#{title} - Skyderby" : "Skyderby: #{base_title}"
  end

  def lang_presentation(lang_code)
    {
      en: 'English',
      ru: 'Русский',
      de: 'Deutsch',
      fr: 'Francais',
      it: 'Italiano',
      es: 'Spanish'
    }[lang_code]
  end

  def lang_menu
    tag.ul(class: 'dropdown-menu dropdown-menu-right', role: 'menu') do
      I18n.available_locales.each do |locale_code|
        link = link_to(lang_presentation(locale_code), { locale: locale_code }, rel: 'nofollow')
        concat tag.li(link, class: (I18n.locale == locale_code ? 'active' : ''))
      end
    end
  end

  def bootstrap_class_for(flash_type)
    case flash_type
    when 'success'
      'alert-success' # Green
    when 'error'
      'alert-danger' # Red
    when 'alert'
      'alert-warning' # Yellow
    when 'notice'
      'alert-info' # Blue
    else
      flash_type.to_s
    end
  end

  def maps_api_key
    ENV.fetch('MAPS_API_KEY', nil)
  end
end
