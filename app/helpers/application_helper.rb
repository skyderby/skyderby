module ApplicationHelper
  def page_title(title)
    base_title = I18n.t 'static_pages.index.title'
    title.present? ? "#{title} - Skyderby" : "Skyderby: #{base_title}"
  end

  def icon_tag(name, **options)
    tag.span class: class_names("icon icon--#{name}", options.delete(:class)), 'aria-hidden': true, **options
  end

  def maps_api_key = ENV.fetch('MAPS_API_KEY', nil)

  def merge_query_params(src, params)
    uri = URI.parse(src)
    new_query = URI.decode_www_form(uri.query.to_s) + params.to_a
    uri.query = URI.encode_www_form(new_query.uniq { |k, _| k })

    uri.to_s
  end
end
