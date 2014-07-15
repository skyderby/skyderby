module ApplicationHelper
  def lang_presentation(l_code)
    l_array = {:en => 'English', :ru => "Русский"}
    return l_array[l_code]
  end

  def lang_menu
    content_tag(:ul, class: ('dropdown-menu'), role: ('menu')) do
      I18n.available_locales.each do |loc|
        locale_param = request.path == root_path ? root_path(locale: loc) : params.merge(locale: loc)
        concat content_tag(:li, (link_to lang_presentation(loc), locale_param), class: (I18n.locale == loc ? "active" : ""))
      end
    end
  end
end
