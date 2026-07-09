module ApplicationHelper
  def page_title(title)
    base_title = I18n.t 'static_pages.index.title'
    title.present? ? "#{title} - Skyderby" : "Skyderby: #{base_title}"
  end

  def icon_tag(name, **options)
    tag.span class: class_names("icon icon--#{name}", options.delete(:class)), 'aria-hidden': true, **options
  end

  def maps_api_key = ENV.fetch('MAPS_API_KEY', nil)

  def turnstile_enabled? = !Rails.env.test? && ENV['TURNSTILE_SITE_KEY'].present?

  def turnstile_tag
    return unless turnstile_enabled?

    tag.div data: { controller: 'turnstile', 'turnstile-sitekey-value': ENV.fetch('TURNSTILE_SITE_KEY', nil) }
  end

  def merge_query_params(src, params)
    uri = URI.parse(src)
    new_query = URI.decode_www_form(uri.query.to_s) + params.to_a
    uri.query = URI.encode_www_form(new_query.uniq { |k, _| k })

    uri.to_s
  end
end
