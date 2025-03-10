module ApplicationHelper
  def page_title(title)
    base_title = I18n.t 'static_pages.index.title'
    title.present? ? "#{title} - Skyderby" : "Skyderby: #{base_title}"
  end

  def svg_icon(name, options = {})
    tag.svg(fill: 'currentColor', class: "svg-icon #{options[:class]}", height: '100%', width: '100%') do
      tag.use(href: "#{image_path("icons/#{name}.svg")}#icon")
    end
  end

  def maps_api_key = ENV.fetch('MAPS_API_KEY', nil)
end
