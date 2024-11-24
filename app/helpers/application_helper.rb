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

  def svg_icon(name)
    tag.svg(fill: 'currentColor', height: '100%', width: '100%') do
      tag.use(href: "#{image_path("icons/#{name}.svg")}#icon")
    end
  end

  def maps_api_key = ENV.fetch('MAPS_API_KEY', nil)
end
